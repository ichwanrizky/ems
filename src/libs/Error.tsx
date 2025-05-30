import { Prisma } from "@prisma/client";

export const HandleError = (error: any) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma request errors (e.g., constraint violations)
    return {
      status: false,
      message: "Request error",
    };
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Handle Prisma validation errors (e.g., invalid data types)
    return {
      status: false,
      message: "Data validation error",
    };
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    // Handle initialization errors (e.g., database connection issues)
    return {
      status: false,
      message: "Database initialization error",
    };
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    // Handle Prisma Rust panic errors (rare critical issues)
    return {
      status: false,
      message: "Critical database error",
    };
  } else if (error instanceof Error) {
    // Handle generic JavaScript errors
    return {
      status: false,
      message: "An unexpected error",
    };
  }

  // Handle unknown error types
  return {
    status: false,
    message: "An unknown error occurred",
  };
};
