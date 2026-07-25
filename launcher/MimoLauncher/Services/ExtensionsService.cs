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
    
    public ExtensionsService()
    {
        _mimoHome = Environment.GetEnvironmentVariable("MIMO_HOME") 
            ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".config", "mimocode");
        _mimoTarget = Path.Combine(_mimoHome, ".mimocode");
        _backupDir = Path.Combine(_mimoHome, $".backup-{DateTime.Now:yyyyMMdd-HHmmss}");
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
            progress?.Report("Checking dependencies...");
            if (!CheckDependencies())
                return false;
            
            progress?.Report("Fixing npm configuration...");
            FixNpmConfig();
            
            progress?.Report("Backing up existing installation...");
            BackupExisting();
            
            progress?.Report("Cloning repository...");
            var tempDir = await CloneRepoAsync();
            
            progress?.Report("Installing extensions...");
            CopyExtensions(tempDir);
            
            progress?.Report("Cleaning up...");
            Cleanup(tempDir);
            
            progress?.Report("Installation complete!");
            return true;
        }
        catch (Exception ex)
        {
            progress?.Report($"Error: {ex.Message}");
            return false;
        }
    }
    
    public async Task<bool> UpdateAsync(IProgress<string>? progress = null)
    {
        return await InstallAsync(progress);
    }
    
    public async Task<bool> UpdateMcpAsync(IProgress<string>? progress = null)
    {
        try
        {
            progress?.Report("Updating MCP servers...");
            
            var mcpDir = Path.Combine(_mimoTarget, "mcp");
            if (!Directory.Exists(mcpDir))
            {
                progress?.Report("MCP directory not found");
                return false;
            }
            
            var installScript = Path.Combine(mcpDir, "install-mcp.sh");
            if (File.Exists(installScript))
            {
                progress?.Report("Running MCP installer...");
                await RunCommandAsync("bash", installScript);
            }
            
            progress?.Report("MCP update complete!");
            return true;
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
            if (!IsInstalled)
            {
                progress?.Report("Extensions not installed");
                return true;
            }
            
            progress?.Report("Backing up before uninstall...");
            BackupExisting();
            
            progress?.Report("Removing extensions...");
            Directory.Delete(_mimoTarget, true);
            
            progress?.Report("Uninstall complete!");
            return true;
        }
        catch (Exception ex)
        {
            progress?.Report($"Error: {ex.Message}");
            return false;
        }
    }
    
    private bool CheckDependencies()
    {
        return CommandExists("git") && CommandExists("npm") && CommandExists("node");
    }
    
    private bool CommandExists(string command)
    {
        try
        {
            var process = Process.Start(new ProcessStartInfo
            {
                FileName = "where",
                Arguments = command,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            });
            process?.WaitForExit();
            return process?.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }
    
    private void FixNpmConfig()
    {
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "npm",
                Arguments = "config set allow-scripts true",
                UseShellExecute = false,
                CreateNoWindow = true
            })?.WaitForExit();
        }
        catch { }
    }
    
    private void BackupExisting()
    {
        if (Directory.Exists(_mimoTarget))
        {
            Directory.CreateDirectory(_backupDir);
            CopyDirectory(_mimoTarget, _backupDir);
        }
    }
    
    private async Task<string> CloneRepoAsync()
    {
        var tempDir = Path.Combine(Path.GetTempPath(), $"mimocode-extensions-{Guid.NewGuid():N}");
        
        await RunCommandAsync("git", $"clone --depth 1 {_repoUrl} {tempDir}");
        
        return tempDir;
    }
    
    private void CopyExtensions(string sourceDir)
    {
        var targetDirs = new[] { "hooks", "tools", "skills", "rules", "workflows", "tui", "mcp" };
        
        foreach (var dir in targetDirs)
        {
            var sourcePath = Path.Combine(sourceDir, dir);
            var targetPath = Path.Combine(_mimoTarget, dir);
            
            if (Directory.Exists(sourcePath))
            {
                Directory.CreateDirectory(targetPath);
                CopyDirectory(sourcePath, targetPath);
            }
        }
        
        // Copy plugin.ts and package.json
        var pluginFile = Path.Combine(sourceDir, "plugin.ts");
        if (File.Exists(pluginFile))
            File.Copy(pluginFile, Path.Combine(_mimoTarget, "plugin.ts"), true);
        
        var packageFile = Path.Combine(sourceDir, "package.json");
        if (File.Exists(packageFile))
            File.Copy(packageFile, Path.Combine(_mimoTarget, "package.json"), true);
    }
    
    private void CopyDirectory(string source, string destination)
    {
        Directory.CreateDirectory(destination);
        
        foreach (var file in Directory.GetFiles(source))
        {
            File.Copy(file, Path.Combine(destination, Path.GetFileName(file)), true);
        }
        
        foreach (var dir in Directory.GetDirectories(source))
        {
            CopyDirectory(dir, Path.Combine(destination, Path.GetFileName(dir)));
        }
    }
    
    private void Cleanup(string tempDir)
    {
        try
        {
            if (Directory.Exists(tempDir))
                Directory.Delete(tempDir, true);
        }
        catch { }
    }
    
    private async Task RunCommandAsync(string command, string arguments)
    {
        var process = Process.Start(new ProcessStartInfo
        {
            FileName = command,
            Arguments = arguments,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true
        });
        
        if (process != null)
        {
            await process.WaitForExitAsync();
        }
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
