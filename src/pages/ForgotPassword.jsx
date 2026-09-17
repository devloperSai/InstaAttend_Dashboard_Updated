import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authService } from "../api/services/auth.service";

// Reuse the same background treatment as the Login page so the two
// screens read as one continuous flow.
const loginBgUrl = "/Login_background_2.png";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });
  const email = form.watch("email");
  const isEmailValid =
    forgotPasswordSchema.shape.email.safeParse(email).success;

  // If the user is already authenticated there's nothing to reset here.
  if (authService.isAuthenticated()) {
    return <Navigate to="/" />;
  }

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      // POST /auth/forgot-password — public endpoint, no Authorization or
      // X-Organization-Id header required (apiClient's interceptor only
      // attaches those when a token/org id already exist in localStorage,
      // which they won't for a signed-out user on this screen).
      await authService.forgotPassword(data.email);
      setSentTo(data.email);
      setEmailSent(true);
    } catch (error) {
      console.error("Forgot password request failed", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Unable to send the reset email. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center lg:justify-start overflow-hidden">
      {/* Background photo — identical treatment to Login.jsx */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 scale-105 blur-[6px]"
          style={{
            backgroundImage: `url(${loginBgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,20,17,0.72) 0%, rgba(6,20,17,0.42) 38%, rgba(6,20,17,0.5) 62%, rgba(6,20,17,0.78) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 22% 42%, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0.08) 32%, rgba(0,0,0,0) 60%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 lg:pl-20 lg:pr-4 lg:ml-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Insta Attend
          </h1>
          <p className="text-white/90 mt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
            HR Management System
          </p>
        </div>

        <Card className="w-full border border-white/40 backdrop-blur-xl bg-card/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset] rounded-2xl">
          {emailSent ? (
            <>
              <CardHeader className="space-y-2 items-center text-center">
                <div className="h-12 w-12 rounded-full bg-instattend-100 text-instattend-600 flex items-center justify-center mb-1">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl text-center">
                  Check your email
                </CardTitle>
                <CardDescription className="text-center">
                  If an account exists for <strong>{sentTo}</strong>, a password
                  reset link is on its way.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center border-t pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-instattend-600 hover:text-instattend-700 font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-center">
                  Forgot password?
                </CardTitle>
                <CardDescription className="text-center">
                  Enter the email associated with your account and we'll send
                  you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {submitError && (
                      <p
                        role="alert"
                        className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      >
                        {submitError}
                      </p>
                    )}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="email@company.com"
                                {...field}
                                className={`pl-10 ${
                                  fieldState.error
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }`}
                              />
                            </FormControl>
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-instattend-500 hover:bg-instattend-600 disabled:blur-[1px]"
                      disabled={isSubmitting || !isEmailValid}
                    >
                      {isSubmitting ? "Sending..." : "Send reset link"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-instattend-600 hover:text-instattend-700 font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </CardFooter>
            </>
          )}
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            © {new Date().getFullYear()} Insta Attend Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
