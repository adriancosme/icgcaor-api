export function randomDate(startHour, endHour) {
  var date = new Date();
  var hour = (startHour + Math.random() * (endHour - startHour)) | 0;
  date.setHours(hour);
  return date;
}