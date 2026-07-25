using System.Globalization;
using Windows.ApplicationModel.Resources;

namespace MimoLauncher.Services;

public class LocalizationService
{
    private ResourceLoader _resourceLoader;
    
    public string CurrentLanguage { get; private set; }
    
    public LocalizationService()
    {
        CurrentLanguage = DetectSystemLanguage();
        _resourceLoader = ResourceLoader.GetForViewIndependentUse($"Strings/{CurrentLanguage}");
    }
    
    private string DetectSystemLanguage()
    {
        var culture = CultureInfo.CurrentUICulture;
        var languageCode = culture.TwoLetterISOLanguageName.ToLower();
        
        // Check if we have translation for this language
        try
        {
            var testLoader = ResourceLoader.GetForViewIndependentUse($"Strings/{languageCode}");
            var testString = testLoader.GetString("AppTitle");
            
            if (!string.IsNullOrEmpty(testString) && testString != "AppTitle")
            {
                return languageCode;
            }
        }
        catch
        {
            // Language not supported
        }
        
        // Default to Russian
        return "ru";
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
        _resourceLoader = ResourceLoader.GetForViewIndependentUse($"Strings/{language}");
    }
    
    public void ToggleLanguage()
    {
        SetLanguage(CurrentLanguage == "ru" ? "en" : "ru");
    }
}
