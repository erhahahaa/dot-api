export const MEDIA_QUERY_WITH = {
  name: true,
  fileSize: true,
  url: true,
  type: true,
};

export const GET_CLUB_QUERY_WITH = {
  media: {
    columns: MEDIA_QUERY_WITH,
  },
  membersPivot: {
    columns: { userId: true },
  },
  programs: {
    columns: { id: true },
  },
  exams: {
    columns: { id: true },
  },
  tacticals: {
    columns: { id: true },
  },
};