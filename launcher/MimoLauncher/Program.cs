using System;
using System.IO;

namespace MimoLauncher;

public static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        var logPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "mimocode_launcher_crash.log");
        try
        {
            WinRT.ComWrappersSupport.InitializeComWrappers();

            Microsoft.UI.Xaml.Application.Start((p) =>
            {
                var context = new Microsoft.UI.Dispatching.DispatcherQueueSynchronizationContext(
                    Microsoft.UI.Dispatching.DispatcherQueue.GetForCurrentThread());
                System.Threading.SynchronizationContext.SetSynchronizationContext(context);
                new App();
            });
        }
        catch (Exception ex)
        {
            File.WriteAllText(logPath,
                $"[{DateTime.Now}] FATAL: {ex.GetType().Name}: {ex.Message}\n{ex.StackTrace}\n");
        }
    }
}
