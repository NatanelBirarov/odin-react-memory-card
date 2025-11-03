import express from "express";
import { Session } from "better-auth/types";

export type IAuthFormInput = {
  email: string;
  password: string;
};

export type IUsernameInput = {
  username: string;
};

export interface AuthRequest extends express.Request {
  userId?: string;
  session?: Session;
}
