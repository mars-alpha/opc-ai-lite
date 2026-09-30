Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$project = Split-Path -Parent $PSScriptRoot
$resultFile = Join-Path $env:TEMP "opc-ai-tencentdb-dev-setup.result.txt"
$logFile = Join-Path $env:TEMP "opc-ai-tencentdb-dev-setup.log"
Remove-Item $resultFile -ErrorAction SilentlyContinue
Remove-Item $logFile -ErrorAction SilentlyContinue

$form = New-Object System.Windows.Forms.Form
$form.Text = "OPC AI - TencentDB Dev Setup"
$form.Size = New-Object System.Drawing.Size(540, 315)
$form.StartPosition = "CenterScreen"
$form.TopMost = $true

$title = New-Object System.Windows.Forms.Label
$title.Text = "只在本机输入数据库密码（不会发送到聊天或 Git）"
$title.AutoSize = $true
$title.Location = New-Object System.Drawing.Point(24, 20)
$form.Controls.Add($title)

$adminLabel = New-Object System.Windows.Forms.Label
$adminLabel.Text = "管理员 opcai 密码"
$adminLabel.AutoSize = $true
$adminLabel.Location = New-Object System.Drawing.Point(24, 70)
$form.Controls.Add($adminLabel)

$adminBox = New-Object System.Windows.Forms.TextBox
$adminBox.Location = New-Object System.Drawing.Point(205, 66)
$adminBox.Size = New-Object System.Drawing.Size(285, 24)
$adminBox.UseSystemPasswordChar = $true
$form.Controls.Add($adminBox)

$appLabel = New-Object System.Windows.Forms.Label
$appLabel.Text = "应用 opc_ai_dev_app 密码"
$appLabel.AutoSize = $true
$appLabel.Location = New-Object System.Drawing.Point(24, 115)
$form.Controls.Add($appLabel)

$appBox = New-Object System.Windows.Forms.TextBox
$appBox.Location = New-Object System.Drawing.Point(205, 111)
$appBox.Size = New-Object System.Drawing.Size(285, 24)
$appBox.UseSystemPasswordChar = $true
$form.Controls.Add($appBox)

$note = New-Object System.Windows.Forms.Label
$note.Text = "提交后自动迁移 opc_ai_dev、运行 DB Acceptance、设置最小权限，并把本地开发连接切换到 opc_ai_dev_app。"
$note.AutoSize = $false
$note.Size = New-Object System.Drawing.Size(465, 50)
$note.Location = New-Object System.Drawing.Point(24, 155)
$form.Controls.Add($note)

$ok = New-Object System.Windows.Forms.Button
$ok.Text = "开始安全配置"
$ok.Location = New-Object System.Drawing.Point(205, 225)
$ok.Size = New-Object System.Drawing.Size(125, 32)
$form.Controls.Add($ok)

$cancel = New-Object System.Windows.Forms.Button
$cancel.Text = "取消"
$cancel.Location = New-Object System.Drawing.Point(350, 225)
$cancel.Size = New-Object System.Drawing.Size(90, 32)
$form.Controls.Add($cancel)

function Write-SafeLog([string]$name, [string]$output) {
  $safe = $output -replace "postgres(?:ql)?://[^\s\r\n]+", "[DATABASE_URL_REDACTED]"
  Add-Content -Path $logFile -Value ("=== " + $name + " ===" + [Environment]::NewLine + $safe) -Encoding UTF8
}

function Run-Step([string]$name, [scriptblock]$action) {
  $output = & $action 2>&1 | Out-String
  $exitCode = $LASTEXITCODE
  Write-SafeLog $name $output
  if ($exitCode -ne 0) {
    throw ($name + " failed with exit code " + $exitCode)
  }
}

$cancel.Add_Click({
  "CANCELLED" | Set-Content -Path $resultFile -Encoding UTF8
  $form.Close()
})

$ok.Add_Click({
  if ([string]::IsNullOrWhiteSpace($adminBox.Text) -or [string]::IsNullOrWhiteSpace($appBox.Text)) {
    [System.Windows.Forms.MessageBox]::Show("两个密码都需要填写。", "OPC AI") | Out-Null
    return
  }

  $ok.Enabled = $false
  $cancel.Enabled = $false
  $form.Text = "OPC AI - 正在配置，请稍候…"
  $form.Refresh()

  $adminEncoded = [System.Uri]::EscapeDataString($adminBox.Text)
  $appEncoded = [System.Uri]::EscapeDataString($appBox.Text)
  $adminBox.Text = ""
  $appBox.Text = ""

  try {
    Set-Location $project

    $env:DATABASE_ENVIRONMENT = "development"
    $env:DATABASE_URL = "postgresql://opcai:$adminEncoded@127.0.0.1:15432/opc_ai_dev"

    Run-Step "DATABASE_TARGET_CHECK" { npm.cmd run db:target:check }
    Run-Step "DATABASE_MIGRATION" { npm.cmd run db:migrate -- --confirm=development }
    Run-Step "CONTENT_WORKBENCH_DB_ACCEPT" { npm.cmd run content:workbench:db:accept }
    Run-Step "DEVELOPMENT_APP_ROLE_PROVISION" { npm.cmd run db:dev:app-role:provision }

    $env:DATABASE_URL = "postgresql://opc_ai_dev_app:$appEncoded@127.0.0.1:15432/opc_ai_dev"
    Run-Step "APP_ROLE_CONNECTION_CHECK" {
      node -e "const postgres=require('postgres');const sql=postgres(process.env.DATABASE_URL,{max:1});(async()=>{try{const r=await sql.unsafe('select current_database() as db, current_user as usr');if(r[0].db!=='opc_ai_dev'||r[0].usr!=='opc_ai_dev_app')process.exit(2);console.log('APP_DATABASE_CONNECTION=PASS')}finally{await sql.end()}})().catch(()=>process.exit(1))"
    }

    $envPath = Join-Path $project ".env.local"
    $backup = Join-Path $env:TEMP ("opc-ai-env-local-before-tencentdb-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".bak")
    if (Test-Path $envPath) {
      Copy-Item $envPath $backup -Force
      $content = [IO.File]::ReadAllText($envPath)
    } else {
      $content = ""
    }

    $devLine = "DATABASE_ENVIRONMENT=development"
    $urlLine = "DATABASE_URL=postgresql://opc_ai_dev_app:$appEncoded@127.0.0.1:15432/opc_ai_dev"

    if ($content -match "(?m)^DATABASE_ENVIRONMENT=.*$") {
      $content = [regex]::Replace($content, "(?m)^DATABASE_ENVIRONMENT=.*$", $devLine)
    } else {
      if ($content.Length -gt 0 -and -not $content.EndsWith([Environment]::NewLine)) {
        $content += [Environment]::NewLine
      }
      $content += $devLine + [Environment]::NewLine
    }

    if ($content -match "(?m)^DATABASE_URL=.*$") {
      $content = [regex]::Replace($content, "(?m)^DATABASE_URL=.*$", $urlLine)
    } else {
      if ($content.Length -gt 0 -and -not $content.EndsWith([Environment]::NewLine)) {
        $content += [Environment]::NewLine
      }
      $content += $urlLine + [Environment]::NewLine
    }

    [IO.File]::WriteAllText($envPath, $content, (New-Object Text.UTF8Encoding($false)))

    @(
      "SUCCESS",
      "ENV_BACKUP=" + $backup,
      "LOG=" + $logFile
    ) | Set-Content -Path $resultFile -Encoding UTF8

    [System.Windows.Forms.MessageBox]::Show(
      "TencentDB 开发库配置完成。请回到 ChatGPT，我会继续自动验收并启动界面。",
      "OPC AI"
    ) | Out-Null

    $form.Close()
  } catch {
    $msg = $_.Exception.Message -replace "postgres(?:ql)?://[^\s\r\n]+", "[DATABASE_URL_REDACTED]"
    @(
      "FAILED",
      "ERROR=" + $msg,
      "LOG=" + $logFile
    ) | Set-Content -Path $resultFile -Encoding UTF8

    [System.Windows.Forms.MessageBox]::Show(
      "配置未完成：" + [Environment]::NewLine + $msg + [Environment]::NewLine + [Environment]::NewLine + "请回到 ChatGPT，我会继续处理。",
      "OPC AI"
    ) | Out-Null

    $ok.Enabled = $true
    $cancel.Enabled = $true
    $form.Text = "OPC AI - TencentDB Dev Setup"
  }
})

[void]$form.ShowDialog()
