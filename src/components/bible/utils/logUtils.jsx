export function groupLogsByDay(logs = []) {
  const grouped = {};
  logs.forEach(log => {
    if (!grouped[log.dateKey]) {
      grouped[log.dateKey] = [];
    }
    grouped[log.dateKey].push(log);
  });
  return grouped;
}

export function getChapterIdsSet(logs = []) {
  return new Set(logs.map(log => log.chapterId));
}