import jwt from "jsonwebtoken";
interface payload {
  id: string;
  email: string;
}
export default function GenerateToken(payload: payload) {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.error("somthing went wrong");
  }
}
