import express from "express";

export type IAuthFormInput = {
  email: string;
  password: string;
};

export type IUsernameInput = {
  username: string;
};

export interface AuthRequest extends express.Request {
  userId?: string;
}
