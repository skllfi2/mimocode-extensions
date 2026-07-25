using Windows.ApplicationModel.Resources;

namespace MimoLauncher.Services;

public class LocalizationService
{
    private readonly ResourceLoader _resourceLoader;
    
    public string CurrentLanguage { get; private set; } = "ru";
    
    public LocalizationService()
    {
        _resourceLoader = ResourceLoader.GetForViewIndependentUse("Strings/ru");
    }
    
    public string GetString(string key)
    {
        try
        {
            return _resourceLoader.GetString(key);
        }
        catch
        {
            return key;
        }
    }
    
    public string GetString(string key, params object[] args)
    {
        try
        {
            var template = _resourceLoader.GetString(key);
            return string.Format(template, args);
        }
        catch
        {
            return key;
        }
    }
    
    public void SetLanguage(string language)
    {
        CurrentLanguage = language;
        _resourceLoader.ResourceLoader = ResourceLoader.GetForViewIndependentUse($"Strings/{language}");
    }
    
    public void ToggleLanguage()
    {
        SetLanguage(CurrentLanguage == "ru" ? "en" : "ru");
    }
}
