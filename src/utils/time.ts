function zfill(value: number, digits: number) {
  const result = '' + value
  return '0'.repeat(Math.max(0, digits - result.length)) + result
}

export function formatDate(date?: Date | string) {
  if (date === undefined) {
    return ''
  }
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return (
    `${date.getFullYear()}-${zfill(date.getMonth() + 1, 2)}-${zfill(date.getDate(), 2)} ` +
    `${zfill(date.getHours(), 2)}:${zfill(date.getMinutes(), 2)}:${zfill(date.getSeconds(), 2)}`
  )
}

export function formatDuration(seconds?: number) {
  if (seconds === undefined) {
    return ''
  }
  return (
    (seconds >= 3600 ? `${Math.floor(seconds / 3600)}:` : '') +
    `${zfill(Math.floor(seconds / 60) % 60, 2)}:${zfill(seconds % 60, 2)}`
  )
}
