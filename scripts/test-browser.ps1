param([int]$Width = 360, [int]$Height = 740, [switch]$Modules)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$browserPath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (!(Test-Path -LiteralPath $browserPath)) { $browserPath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' }
if (!(Test-Path -LiteralPath $browserPath)) { throw 'Chromium browser not found' }
$tempRoot = Join-Path $projectRoot '.test-output'
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
$html = [IO.File]::ReadAllText((Join-Path $projectRoot 'index.html'))
$html = $html.Replace('<head>', '<head><base href="../">')
$loader = if ($Modules) { '<script type="module" src="js/main.js"></script>' } else { '<script src="js/bundle.js"></script>' }
$html = [regex]::Replace($html, '(?s)<script>.*?</script>', ($loader + '<script src="tests/smoke.js"></script>'))
$mode = if ($Modules) { 'modules' } else { 'bundle' }
$testPage = Join-Path $tempRoot "browser-test-$Width-$Height-$mode.html"
[IO.File]::WriteAllText($testPage, $html, [Text.UTF8Encoding]::new($false))
$profile = Join-Path $tempRoot ('profile-' + [guid]::NewGuid().ToString('N'))
$logPath = Join-Path $tempRoot "browser-$Width-$Height.log"
$screenshotPath = Join-Path $tempRoot "screen-$Width-$Height.png"
$url = [uri]::new($testPage).AbsoluteUri
$port = Get-Random -Minimum 9400 -Maximum 9900
$browserArgs = @('--headless', '--disable-gpu', '--no-sandbox', '--in-process-gpu', '--disable-software-rasterizer', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--allow-file-access-from-files', "--remote-debugging-port=$port", "--user-data-dir=`"$profile`"", 'about:blank')
$process = Start-Process -FilePath $browserPath -ArgumentList $browserArgs -WindowStyle Hidden -PassThru -RedirectStandardError $logPath
$socket = [Net.WebSockets.ClientWebSocket]::new()
$script:commandId = 0
function Send-Cdp($method, $parameters) {
  $script:commandId++
  $id = $script:commandId
  $json = @{ id = $id; method = $method; params = $parameters } | ConvertTo-Json -Depth 20 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $socket.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  while ($true) {
    $stream = [IO.MemoryStream]::new()
    do {
      $buffer = [byte[]]::new(65536)
      $receive = $socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), [Threading.CancellationToken]::None).GetAwaiter().GetResult()
      $stream.Write($buffer, 0, $receive.Count)
    } while (!$receive.EndOfMessage)
    $response = [Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
    $stream.Dispose()
    if ($response.id -eq $id) {
      if ($response.error) { throw ($response.error | ConvertTo-Json -Compress) }
      return $response.result
    }
  }
}
try {
  $page = $null
  for ($attempt = 0; $attempt -lt 50; $attempt++) {
    try { $targets = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json" -UseBasicParsing; $page = @($targets | Where-Object { $_.type -eq 'page' })[0]; if ($page) { break } } catch { }
    Start-Sleep -Milliseconds 100
  }
  if (!$page) { throw 'Browser debugging endpoint unavailable' }
  $socket.ConnectAsync([uri]$page.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  Send-Cdp 'Emulation.setDeviceMetricsOverride' @{ width = $Width; height = $Height; deviceScaleFactor = 1; mobile = $true } | Out-Null
  Send-Cdp 'Page.navigate' @{ url = $url } | Out-Null
  $raw = $null
  for ($attempt = 0; $attempt -lt 70; $attempt++) {
    Start-Sleep -Milliseconds 150
    $evaluation = Send-Cdp 'Runtime.evaluate' @{ expression = 'document.getElementById("test-results")?.textContent || null'; returnByValue = $true }
    $raw = $evaluation.result.value
    if ($raw) { break }
  }
  $dom = Send-Cdp 'Runtime.evaluate' @{ expression = 'document.documentElement.outerHTML'; returnByValue = $true }
  [IO.File]::WriteAllText((Join-Path $tempRoot "dom-$Width-$Height.html"), $dom.result.value, [Text.UTF8Encoding]::new($false))
  $screenshot = Send-Cdp 'Page.captureScreenshot' @{ format = 'png'; captureBeyondViewport = $false }
  [IO.File]::WriteAllBytes($screenshotPath, [Convert]::FromBase64String($screenshot.data))
  if (!$raw) { throw "Browser did not return test results; inspect $logPath" }
  $result = $raw | ConvertFrom-Json
  $result | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $tempRoot "results-$Width-$Height.json")
  $result.results | Format-Table passed, name, error -AutoSize
  Write-Output "$($result.passed)/$($result.total) checks passed at ${Width}x${Height}"
  if ($result.passed -ne $result.total) { exit 1 }
} finally {
  $socket.Dispose()
  if (!$process.HasExited) { $process.Kill() }
}
