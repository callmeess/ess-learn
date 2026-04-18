using EssLearn.Core.Enums;

namespace EssLearn.Application.Dtos;

// --- Progress ---
public record UpdateProgressDto(int WatchedSeconds, VideoStatus Status);
