using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml;
using WinRT;

namespace MimoLauncher;

internal static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        WinRT.ComWrappersSupport.InitializeComWrappers();
        
        Application.Start((p) =>
        {
            var context = new DispatcherQueueSynchronizationContext(
                DispatcherQueue.GetForCurrentThread());
            SynchronizationContext.SetSynchronizationContext(context);
            
            new App();
        });
    }
}
