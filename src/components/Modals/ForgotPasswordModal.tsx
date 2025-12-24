
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  XCircle,
  Check,
  Mail,
  Shield,
  Lock,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import api from "@/api/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

type Step = "email" | "otp" | "newPassword" | "success";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getPasswordValidation = (password: string) => ({
  minLength: password.length >= 8,
  oneUppercase: /[A-Z]/.test(password),
  oneLowercase: /[a-z]/.test(password),
  oneNumber: /\d/.test(password),
  oneSpecial: /[@$!%*?&]/.test(password),
});

export default function ForgotPasswordModal({
  open,
  onOpenChange,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpWindowSeconds, setOtpWindowSeconds] = useState(300);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setResendCountdown(0);
    setAttemptsLeft(3);
    setOtpWindowSeconds(300);
    setStep("email");
    setShowNewPassword(false);
  setShowConfirmPassword(false);
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  useEffect(() => {
    if (step === "otp") {
      const firstOtpSlot = otpInputRef.current?.querySelector("input");
      if (firstOtpSlot) {
        setTimeout(() => firstOtpSlot.focus(), 100);
      }
    }
  }, [step]);

  const handleSendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.sendResetOTP(email);
      toast.success("Verification code sent!");

      setAttemptsLeft(res.attemptsLeft || 3);
      setOtpWindowSeconds(res.window || 300);
      setStep("otp");
      setResendCountdown(60);
    } catch (err: any) {
      console.log(err," error in sending OTP");
      const msg = err?.message || "Failed to send verification code";
      setError(msg);
      toast.error(msg);
      if (err.status === 429) setAttemptsLeft(0);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    setOtp("");
    await handleSendOTP();
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.verifyOTP({ email, otp });
      toast.success("Code verified!");
      setStep("newPassword");
      setOtp("");
    } catch (err: any) {
      const msg = err?.message || "Invalid or expired code";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const validation = getPasswordValidation(newPassword);
    const isValid = Object.values(validation).every(Boolean);

    if (!isValid) {
      setError("Please meet all password requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.resetPassword({ email, newPassword });
      toast.success("Password reset successfully!");
      setStep("success");
    } catch (err: any) {
      const msg = err?.message || "Failed to reset password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => {
    const steps = [
      { key: "email", label: "Email", icon: Mail },
      { key: "otp", label: "Verify", icon: Shield },
      { key: "newPassword", label: "New Password", icon: Lock },
    ];

    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = step === stepItem.key;
          const isFuture = index > currentIndex;

          return (
            <div key={stepItem.key} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted &&
                    "bg-gradient-to-r from-teal-500 to-indigo-500 border-transparent text-white",
                  isCurrent &&
                    "border-gradient-to-r from-teal-500 to-indigo-500 bg-white text-gradient-to-r from-teal-500 to-indigo-500",
                  isFuture && "border-gray-300 bg-white text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 transition-all duration-300",
                    isCompleted
                      ? "bg-gradient-to-r from-teal-500 to-indigo-500"
                      : "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const PasswordRequirements = () => {
    const validation = getPasswordValidation(newPassword);
    const requirements = [
      { key: "minLength", label: "8+ characters" },
      { key: "oneUppercase", label: "Uppercase letter" },
      { key: "oneLowercase", label: "Lowercase letter" },
      { key: "oneNumber", label: "Number" },
      { key: "oneSpecial", label: "Special character" },
    ];

    const metCount = Object.values(validation).filter(Boolean).length;
    const totalCount = requirements.length;

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-slate-700">Password strength</span>
          <span className="text-slate-500">
            {metCount}/{totalCount}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              metCount === 0 && "bg-red-500 w-0",
              metCount === 1 && "bg-red-500 w-1/5",
              metCount === 2 && "bg-orange-500 w-2/5",
              metCount === 3 && "bg-yellow-500 w-3/5",
              metCount === 4 && "bg-blue-500 w-4/5",
              metCount === 5 && "bg-green-500 w-full"
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {requirements.map((req) => {
            const isMet = validation[req.key as keyof typeof validation];
            return (
              <div
                key={req.key}
                className={cn(
                  "flex items-center transition-all duration-200",
                  isMet ? "text-green-600" : "text-slate-500"
                )}
              >
                {isMet ? (
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                )}
                <span className="text-xs">{req.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
        <div className="p-8">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-indigo-500">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {step === "success" ? "Password Reset!" : "Reset Password"}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {step === "email" && "Enter your email to get started"}
              {step === "otp" && "Check your email for the verification code"}
              {step === "newPassword" && "Create your new password"}
              {step === "success" &&
                "Your password has been updated successfully"}
            </p>
          </DialogHeader>

          {step !== "success" && <StepIndicator />}

          <div className="space-y-6">
            {/* Step 1: Email */}
            {step === "email" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      placeholder="Enter your email"
                      className="pl-10 h-12 rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                      onKeyDown={(e) =>
                        e.key === "Enter" && email && handleSendOTP()
                      }
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="rounded-lg">
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSendOTP}
                  disabled={!email || loading}
                  className="w-full h-12 font-semibold bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === "otp" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-600">We sent a code to</p>
                  <p className="font-semibold text-slate-900">{email}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                    <span>
                      Expires in {Math.floor(otpWindowSeconds / 60)}min
                    </span>
                    <span>•</span>
                    <span>{attemptsLeft} attempts left</span>
                  </div>
                </div>

                <div className="flex justify-center" ref={otpInputRef}>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    onComplete={handleVerifyOTP}
                    disabled={loading}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-12 h-12 border-2 text-lg font-semibold rounded-xl transition-all border-slate-300 data-[state=active]:border-teal-500 data-[state=complete]:border-green-500"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <Alert variant="destructive" className="rounded-lg">
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                    }}
                    className="flex-1 h-11 rounded-lg border-slate-300 hover:bg-slate-50 transition-colors"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6 || loading}
                    className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={
                      resendCountdown > 0 || loading || attemptsLeft <= 0
                    }
                    className={cn(
                      "text-slate-600 hover:text-teal-600 transition-colors text-sm",
                      (resendCountdown > 0 || attemptsLeft <= 0) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        resendCountdown > 0 ? "animate-spin" : ""
                      }`}
                    />
                    {attemptsLeft <= 0
                      ? "No attempts left"
                      : resendCountdown > 0
                      ? `Resend available in ${resendCountdown}s`
                      : "Resend code"}
                  </Button>
                </div>
              </div>
            )}

            {step === "newPassword" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-sm font-medium text-slate-700"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create new password"
                      className="pl-10 pr-10 h-12 rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <PasswordRequirements />

                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-12 rounded-lg border-slate-300 focus:border-teal-500 focus:ring-teal-500 transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="rounded-lg">
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleResetPassword}
                  disabled={
                    !Object.values(getPasswordValidation(newPassword)).every(
                      Boolean
                    ) ||
                    newPassword !== confirmPassword ||
                    loading
                  }
                  className="w-full h-12 font-semibold bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            )}

            {/* Success */}
            {step === "success" && (
              <div className="text-center py-4 space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    Password Updated!
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Your password has been reset successfully. You can now sign
                    in with your new credentials.
                  </p>
                </div>
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full h-12 font-semibold bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Continue to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
