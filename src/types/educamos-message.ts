export type EducamosMessage = {
  date: string;
  from: string;
  subject: string;
  isResponse: boolean;
  body: string;
  centre: string;
  attachments?: string[];
  group?: string;
  error?: string;
};
