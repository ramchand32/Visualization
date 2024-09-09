export interface SessionModel {
  email: string;
  expiry: Date;
  expiryinsecs: number;
  isAdmin: boolean;
  sessionkey: string;
  user: string;
  name: string;
  usertype: string;
  validity: string;
  timezone: string;
  subscriptions: Array<string>;
}
