using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;

namespace MimoLauncher.Services;

public class ExtensionsService
{
    private readonly string _repoUrl = "https://github.com/skllfi2/mimocode-extensions.git";
    private readonly string _mimoHome;
    private readonly string _mimoTarget;
    private readonly string _backupDir;
    private readonly string _setupScriptPath;
    
    public ExtensionsService()
    {
        _mimoHome = Environment.GetEnvironmentVariable("MIMO_HOME") 
            ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".config", "mimocode");
        _mimoTarget = Path.Combine(_mimoHome, ".mimocode");
        _backupDir = Path.Combine(_mimoHome, $".backup-{DateTime.Now:yyyyMMdd-HHmmss}");
        _setupScriptPath = Path.Combine(AppContext.BaseDirectory, "setup.ps1");
    }
    
    public bool IsInstalled => Directory.Exists(_mimoTarget);
    
    public async Task<ExtensionsStatus> GetStatusAsync()
    {
        var status = new ExtensionsStatus();
        
        if (!IsInstalled)
        {
            status.IsInstalled = false;
            return status;
        }
        
        status.IsInstalled = true;
        status.HooksCount = CountFiles(Path.Combine(_mimoTarget, "hooks"), "*.ts");
        status.ToolsCount = CountFiles(Path.Combine(_mimoTarget, "tools"), "*.ts");
        status.SkillsCount = CountDirectories(Path.Combine(_mimoTarget, "skills"));
        status.RulesCount = CountFiles(Path.Combine(_mimoTarget, "rules"), "*.md");
        status.WorkflowsCount = CountFiles(Path.Combine(_mimoTarget, "workflows"), "*.js");
        status.TuiCount = CountFiles(Path.Combine(_mimoTarget, "tui"), "*.tsx");
        
        return status;
    }
    
    public async Task<bool> InstallAsync(IProgress<string>? progress = null)
    {
        try
        {
            progress?.Report("Installing extensions via setup.ps1...");
            var result = await RunPowerShellScriptAsync("install");
            progress?.Report(result ? "Installation complete!" : "Installation failed");
            return result;
        }
        catch (Exception ex)
        {
            progress?.Report($"Error: {ex.Message}");
            return false;
        }
    }
    
    public async Task<bool> UpdateAsync(IProgress<string>? progress = null)
    {
        try
        {
            progress?.Report("Updating extensions via setup.ps1...");
            var result = await RunPowerShellScriptAsync("update");
            progress?.Report(result ? "Update complete!" : "Update failed");
            return result;
        }
        catch (Exception ex)
        {
            progress?.Report($"Error: {ex.Message}");
            return false;
        }
    }
    
    public async Task<bool> UpdateMcpAsync(IProgress<string>? progress = null)
    {
        try
        {
            progress?.Report("Updating MCP servers via setup.ps1...");
            var result = await RunPowerShellScriptAsync("update:mcp");
            progress?.Report(result ? "MCP update complete!" : "MCP update failed");
            return result;
        }
        catch (Exception ex)
        {
            progress?.Report($"Error: {ex.Message}");
            return false;
        }
    }
    
    public async Task<bool> UninstallAsync(IProgress<string>? progress = null)
    {
        try
        {
            progress?.Report("Uninstalling via setup.ps1...");
            var result = await RunPowerShellScriptAsync("uninstall");
            progress?.Report(result ? "Uninstall complete!" : "Uninstall failed");
            return result;
        }
        catch (Exception ex)
        {
            progress?.Report($"Error: {ex.Message}");
            return false;
        }
    }
    
    private async Task<bool> RunPowerShellScriptAsync(string command)
    {
        var scriptExists = File.Exists(_setupScriptPath);
        
        // If script doesn't exist in app directory, try to find it
        if (!scriptExists)
        {
            // Try common locations
            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "setup.ps1"),
                Path.Combine(Environment.CurrentDirectory, "setup.ps1"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Downloads", "setup.ps1")
            };
            
            foreach (var path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    _setupScriptPath = path;
                    scriptExists = true;
                    break;
                }
            }
        }
        
        if (!scriptExists)
        {
            // Download the script if not found
            await DownloadSetupScriptAsync();
        }
        
        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = $"-ExecutionPolicy Bypass -File \"{_setupScriptPath}\" {command}",
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        };
        
        var process = Process.Start(startInfo);
        if (process == null) return false;
        
        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();
        
        await process.WaitForExitAsync();
        
        return process.ExitCode == 0;
    }
    
    private async Task DownloadSetupScriptAsync()
    {
        var url = "https://raw.githubusercontent.com/skllfi2/mimocode-extensions/main/setup.ps1";
        
        using var httpClient = new HttpClient();
        var content = await httpClient.GetStringAsync(url);
        
        // Save to temp directory
        _setupScriptPath = Path.Combine(Path.GetTempPath(), "mimocode-setup.ps1");
        await File.WriteAllTextAsync(_setupScriptPath, content);
    }
    
    private int CountFiles(string directory, string pattern)
    {
        if (!Directory.Exists(directory)) return 0;
        return Directory.GetFiles(directory, pattern).Length;
    }
    
    private int CountDirectories(string directory)
    {
        if (!Directory.Exists(directory)) return 0;
        return Directory.GetDirectories(directory).Length;
    }
}

public class ExtensionsStatus
{
    public bool IsInstalled { get; set; }
    public int HooksCount { get; set; }
    public int ToolsCount { get; set; }
    public int SkillsCount { get; set; }
    public int RulesCount { get; set; }
    public int WorkflowsCount { get; set; }
    public int TuiCount { get; set; }
    
    public int TotalCount => HooksCount + ToolsCount + SkillsCount + RulesCount + WorkflowsCount + TuiCount;
}
