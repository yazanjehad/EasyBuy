export type AuthJwtPayload = {
  sub: number;
  email: string;
  iat?: number; // أصبح اختياريًا
  exp?: number; // أصبح اختياريًا
};
