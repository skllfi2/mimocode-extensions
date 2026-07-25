using System;
using System.Diagnostics;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MimoLauncher.Services;

public class TerminalService : IDisposable
{
    private Process? _process;
    private readonly StringBuilder _outputBuffer = new();
    private CancellationTokenSource? _cts;
    
    public event EventHandler<string>? OutputReceived;
    public event EventHandler? ProcessExited;
    public bool IsRunning => _process != null && !_process.HasExited;
    
    public string CurrentDirectory { get; set; } = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
    
    public void SetWorkingDirectory(string path)
    {
        if (Directory.Exists(path))
        {
            CurrentDirectory = path;
        }
    }
    
    public async Task StartAsync(string? workingDirectory = null)
    {
        if (IsRunning) return;
        
        _cts = new CancellationTokenSource();
        
        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = "-NoLogo -NoProfile -NoExit",
            UseShellExecute = false,
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = false,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8
        };
        
        if (!string.IsNullOrEmpty(workingDirectory) && Directory.Exists(workingDirectory))
        {
            startInfo.WorkingDirectory = workingDirectory;
            CurrentDirectory = workingDirectory;
        }
        
        _process = Process.Start(startInfo);
        
        if (_process == null)
        {
            throw new InvalidOperationException("Failed to start PowerShell process");
        }
        
        _process.EnableRaisingEvents = true;
        _process.Exited += OnProcessExited;
        
        // Start reading output
        _ = ReadOutputAsync(_cts.Token);
        _ = ReadErrorAsync(_cts.Token);
        
        OutputReceived?.Invoke(this, $"PowerShell started in {CurrentDirectory}\n");
    }
    
    public async Task SendCommandAsync(string command)
    {
        if (!IsRunning || _process?.StandardInput == null) return;
        
        try
        {
            await _process.StandardInput.WriteLineAsync(command);
            await _process.StandardInput.FlushAsync();
        }
        catch (Exception ex)
        {
            OutputReceived?.Invoke(this, $"Error: {ex.Message}\n");
        }
    }
    
    public async Task SendMimoCommandAsync(string? workingDirectory = null)
    {
        var dir = workingDirectory ?? CurrentDirectory;
        await SendCommandAsync($"cd '{dir}'; mimo");
    }
    
    private async Task ReadOutputAsync(CancellationToken ct)
    {
        if (_process?.StandardOutput == null) return;
        
        try
        {
            while (!ct.IsCancellationRequested && !_process.HasExited)
            {
                var line = await _process.StandardOutput.ReadLineAsync(ct);
                if (line != null)
                {
                    OutputReceived?.Invoke(this, line + "\n");
                }
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            OutputReceived?.Invoke(this, $"Read error: {ex.Message}\n");
        }
    }
    
    private async Task ReadErrorAsync(CancellationToken ct)
    {
        if (_process?.StandardError == null) return;
        
        try
        {
            while (!ct.IsCancellationRequested && !_process.HasExited)
            {
                var line = await _process.StandardError.ReadLineAsync(ct);
                if (line != null)
                {
                    OutputReceived?.Invoke(this, $"ERROR: {line}\n");
                }
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            OutputReceived?.Invoke(this, $"Read error: {ex.Message}\n");
        }
    }
    
    private void OnProcessExited(object? sender, EventArgs e)
    {
        ProcessExited?.Invoke(this, EventArgs.Empty);
    }
    
    public void Stop()
    {
        _cts?.Cancel();
        
        try
        {
            if (_process != null && !_process.HasExited)
            {
                _process.Kill();
            }
        }
        catch { }
        
        _process?.Dispose();
        _process = null;
    }
    
    public void Dispose()
    {
        Stop();
        _cts?.Dispose();
    }
}
