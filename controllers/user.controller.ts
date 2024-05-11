import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

const User = require("../lib/prisma").user;
const saltRounds = 10;

export const UserController = {
  createUser: async (req: Request, res: Response) => {
    try {
      console.log("creating user...");
      const { email, password } = req.body;
      const salt = await bcrypt.genSalt(saltRounds);

      if (!email || !password) {
        return res.status(400).json({
          status: false,
          data: {
            message: "All mandatory fields must be completed.",
          },
        });
      }

      var user = await User.create({
        data: {
          email: email,
          password: await bcrypt.hash(password, salt),
        },
      });

      user = await User.findFirst({
        where: {
          email: user.email,
        },
        select: {
          email: true,
        },
      });

      console.log("Signed Up");
      return res.status(201).json({
        status: true,
        data: {
          user: user,
          token: jwt.sign({ userId: user }, "@/#SECRET_2ALSY_ACCESS_TOKEN#:@", {
            expiresIn: "24h",
          }),
        },
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      console.log("updating user...");
      const { email, newEmail } = req.body;

      if (!email || !newEmail) {
        return res.status(400).json({
          status: false,
          data: {
            message: "All mandatory fields must be completed.",
          },
        });
      }

      await User.update({
        where: {
          email: email,
        },
        data: {
          email: newEmail,
        },
      });

      const updatedUser = await User.findFirst({
        where: {
          email: newEmail,
        },
        select: {
          email: true,
        },
      });

      console.log("Updated");
      res.status(201).json({ status: true, data: updatedUser });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      console.log("updating user...");
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: false,
          data: {
            message: "All mandatory fields must be completed.",
          },
        });
      }

      await User.delete({
        where: {
          email: email,
        },
      });

      console.log("Deleted");
      res.status(201).json({
        status: true,
        data: { message: "The User had been correctly deleted" },
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  logUser: async (req: Request, res: Response) => {
    try {
      console.log("log user...");
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: false,
          data: {
            message: "All mandatory fields must be completed.",
          },
        });
      }

      const user = await User.findFirst({
        where: {
          email: email,
        },
        select: {
          email: true,
          password: true,
        },
      });

      if (user) {
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          console.log("Login successful");
          const token = jwt.sign(
            { userId: user },
            "@/#SECRET_2ALSY_ACCESS_TOKEN#:@",
            {
              expiresIn: "24h",
            }
          );

          res.cookie('2asly_access', token, {maxAge: 360000});

          return res.status(201).json({
            status: true,
            data: {
              user: user,
            },
          });
        } else {
          console.log("Login failed: Invalid password");
          return res.status(201).json({
            status: true,
            data: {
              message: "The password is invalid",
            },
          });
        }
      } else {
        return res.status(400).json({
          status: false,
          data: { message: "email is not correct" },
        });
      }
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  },
};
