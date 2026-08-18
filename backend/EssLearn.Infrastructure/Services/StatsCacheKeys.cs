namespace EssLearn.Infrastructure.Services;

public static class StatsCacheKeys
{
    private static readonly string[] Ranges = ["all", "week", "month", "quarter"];

    public static string KeyFor(string range) => $"dashboard:stats:{range}";

    public static string[] All()
    {
        return Ranges.Select(KeyFor).ToArray();
    }
}
