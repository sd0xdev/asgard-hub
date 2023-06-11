export function validateYoutubeUrl(messageContent: string) {
  const regex =
    // eslint-disable-next-line no-useless-escape
    /^(?:https:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]{11})(?:\S+)?$/;
  const matched = messageContent.match(regex);
  const isYtRequest = matched || messageContent.startsWith('YT');
  return isYtRequest;
}
