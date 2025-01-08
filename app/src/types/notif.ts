export type Notification = {
  id: number;
  message: string;
  timestamp: string;
  link: string;
  type: Notif;
};
export enum Notif {
  Edited = "edited",
  Deleted = "deleted",
  Chat = "chat",
}
