import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { emailSchema } from "../utils/email";
import {
  createAccessToken,
  createAuthorizationCode,
  createRefreshToken,
  verifyAuthorizationCode,
} from "../utils/tokenUtils";
import { createClerkClient } from '@clerk/backend';


// Define interface for the request with auth
interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, confirmPassword, firstName, lastName } =
      req.body;

    try {
      await emailSchema.validate(email);
    } catch (error) {
      return res.status(400).json({
        success: 0,
        message: "Invalid email address",
        data: null,
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: 0,
        message: "Passwords do not match",
        data: null,
      });
    }

    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: 0,
        message: "User with this email or username already exists",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      balance: 0, // Initialize balance to 0
    });

    await user.save();

    const token = jwt.sign(
      { userId: user.id },
      process.env.SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: 1,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          balance: user.balance,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: 0,
        message: "Login and password are required",
        data: null,
      });
    }

    // Find user
    const user: IUser | null = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        success: 0,
        message: "Invalid credentials",
        data: null,
      });
    }

    // Generate authorization code
    const authCode = createAuthorizationCode(user.id);

    // Immediately exchange the code for tokens
    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    res.json({
      success: 1,
      message: "Login successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 3600, // 1 hour
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};


// Define interface for the request with auth
interface AuthenticatedRequest extends Request {
  auth?: {
    userId?: string;
  };
}


 

export const handleClerkAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      clerkId, 
      email, 
      firstName, 
      lastName, 
      imageUrl 
    } = req.body;

    // Create clerk client
    const clerkClient = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY! 
    });

    // Verify the user with Clerk if you have clerkId
    if (clerkId) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        if (!clerkUser) {
          return res.status(401).json({
            success: 0,
            message: "Invalid Clerk user",
            data: null
          });
        }
      } catch (error) {
        console.error('Error verifying Clerk user:', error);
        return res.status(401).json({
          success: 0,
          message: "Failed to verify Clerk user",
          data: null
        });
      }
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email },
        { clerkId }
      ]
    });

    if (!user) {
      user = new User({
        email,
        clerkId,
        firstName,
        lastName,
        username: email.split('@')[0],
        authProvider: 'clerk',
        profilePicture: imageUrl,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
      });

      await user.save();
    } else if (!user.clerkId) {
      user.clerkId = clerkId;
      user.authProvider = 'clerk';
      if (imageUrl) user.profilePicture = imageUrl;
      await user.save();
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    res.json({
      success: 1,
      message: "Authentication successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 3600,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        }
      }
    });

  } catch (err) {
    console.error('Clerk auth error:', err);
    res.status(500).json({
      success: 0,
      message: "Server error during authentication",
      data: null
    });
  }
};


export const initiateLogin = async (req: Request, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: 0,
        message: "Login and password are required",
        data: null,
      });
    }

    // Find user
    const user: IUser | null = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        success: 0,
        message: "Invalid credentials",
        data: null,
      });
    }

    // Generate authorization code
    const authCode = createAuthorizationCode(user.id);

    // In a real-world scenario, you'd redirect the user back to the client
    // with this auth code. For this example, we'll just return it.
    res.json({
      success: 1,
      message: "Authorization code generated",
      data: {
        code: authCode,
      },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({
        success: 0,
        message: "Server error: " + err.message,
        data: null,
      });
    } else {
      res.status(500).json({
        success: 0,
        message: "An unknown error occurred",
        data: null,
      });
    }
  }
};

export const exchangeToken = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // Verify the authorization code
    const userId = verifyAuthorizationCode(code);

    if (!userId) {
      return res.status(400).json({
        success: 0,
        message: "Invalid authorization code",
        data: null,
      });
    }

    // Generate access token and refresh token
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId);

    res.json({
      success: 1,
      message: "Token exchange successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "Bearer",
        expires_in: 3600, // 1 hour
      },
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({
        success: 0,
        message: "Token exchange error: " + err.message,
        data: null,
      });
    } else {
      res.status(500).json({
        success: 0,
        message: "An unknown error occurred during token exchange",
        data: null,
      });
    }
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: 0,
        message: "User not found",
        data: null,
      });
    }

    // Here you would typically generate a password reset token and send an email
    // For this example, we'll just return a success message

    res.json({
      success: 1,
      message: "Password reset instructions sent to email",
      data: { email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: 0,
      message: "Server error",
      data: null,
    });
  }
};




