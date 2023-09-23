export function getProgress(assignment) {
  if (!assignment) {
    return 'Unknown'
  }
  if (assignment.type === 'video') {
    return assignment.status
  }
  if (!assignment.progress) {
    return 'Unknown'
  }
  const progress = assignment.progress
  let suffix = ''
  if (
    assignment.score !== undefined &&
    assignment.score !== null &&
    assignment.max_score !== undefined &&
    assignment.max_score !== null &&
    !progress.scoring
  ) {
    suffix += ' (' + assignment.score + '/' + assignment.max_score + ')'
  }
  if (progress.started) {
    return 'Started' + suffix
  } else if (progress.submitted) {
    return 'Submitted' + suffix
  } else if (progress.scoring) {
    return 'Scoring' + suffix
  } else if (progress.complete) {
    return 'Complete' + suffix
  } else if (progress.not_started) {
    return 'Not started' + suffix
  } else if (progress.mcq_scoring) {
    return 'MCQ scoring' + suffix
  } else if (progress.student_scored) {
    return 'Student scored' + suffix
  } else if (progress.teacher_and_student_scored) {
    return 'Teacher/student scored' + suffix
  } else if (progress.ready_to_score) {
    return 'Ready to score' + suffix
  } else {
    return 'Unknown' + suffix
  }
}
