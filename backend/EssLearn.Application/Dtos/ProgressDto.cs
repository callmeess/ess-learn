using EssLearn.Core.Enums;

namespace EssLearn.Application.Dtos;

public record ProgressDto(int VideoId, VideoStatus Status, int WatchedSeconds, DateTime? LastWatchedAt, DateTime? CompletedAt);
