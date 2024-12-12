"use client";

import { signInAction } from "@/actions/auth";
import { useAction } from "@/hooks/use-action";
import { Button, buttonVariants } from "../shadcn/button";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import FormInput from "../form/form-input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../shadcn/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SignIn() {
  const router = useRouter();

  const { execute, fieldErrors, isLoading } = useAction(signInAction, {
    onProceed() {
      toast.loading("Signing in...", {
        id: "sign-in",
      });
    },
    onFieldError() {
      toast.dismiss("sign-in");
    },
    onError() {
      toast.error("Invalid credentials");
      toast.dismiss("sign-in");
    },
    onSuccess() {
      toast.success("Successfully signed in");
      router.push("/dashboard");
      toast.dismiss("sign-in");
    },
  });

  const submitAction = (formData: FormData) => {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    execute({ username, password });
  };

  return (
    <Card className="max-w-[450px] min-w-[350px] w-[40vw]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Login to access your Dashboard. {isLoading ? "Please wait..." : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          className="flex flex-col gap-4 max-w-screen-sm"
          action={submitAction}
        >
          <FormInput
            id="username"
            type="text"
            label="Username"
            errors={fieldErrors}
            placeholder="Input your username"
          />
          <FormInput
            id="password"
            label="Password"
            type="password"
            showTogglePassword={true}
            errors={fieldErrors}
            placeholder="Input your password"
          />
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="submit" form="login-form" disabled={isLoading}>
          <>Sign In</>
          {isLoading && <Loader className="animate-spin" />}
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </Link>
      </CardFooter>
    </Card>
  );
}
