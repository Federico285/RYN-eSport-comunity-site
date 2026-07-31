import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { openPositions, siteConfig } from "../data/siteConfig";
import { useTurnstile } from "../hooks/useTurnstile";
import { submitApplication } from "../lib/api";
import {
  applicationSchema,
  type ApplicationFormValues,
} from "../schemas/applicationSchema";

type ApplicationFormProps = {
  selectedPositionId: string;
};

const defaultValues: ApplicationFormValues = {
  fullName: "",
  email: "",
  discordUsername: "",
  positionId: "",
  age: siteConfig.minimumAge,
  confirmsMinimumAge: false,
  experience: "",
  motivation: "",
  weeklyAvailability: "",
  portfolioUrl: "",
  cvUrl: "",
  privacyConsent: false,
  website: "",
  turnstileToken: "",
};

export function ApplicationForm({ selectedPositionId }: ApplicationFormProps) {
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  }>();
  const statusRef = useRef<HTMLDivElement | null>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
  });

  const handleTurnstileSuccess = useCallback(
    (token: string) => {
      setValue("turnstileToken", token, { shouldValidate: true });
    },
    [setValue],
  );

  const handleTurnstileReset = useCallback(() => {
    setValue("turnstileToken", "", { shouldValidate: true });
  }, [setValue]);

  const turnstile = useTurnstile({
    siteKey,
    action: "application",
    onSuccess: handleTurnstileSuccess,
    onExpire: handleTurnstileReset,
    onError: handleTurnstileReset,
  });

  useEffect(() => {
    if (selectedPositionId) {
      setValue("positionId", selectedPositionId, { shouldValidate: true });
    }
  }, [selectedPositionId, setValue]);

  useEffect(() => {
    if (status) statusRef.current?.focus();
  }, [status]);

  const onSubmit = async (values: ApplicationFormValues) => {
    setStatus(undefined);
    const result = await submitApplication(values);

    if (result.success) {
      reset(defaultValues);
      turnstile.reset();
      setStatus({
        type: "success",
        message:
          "Candidatura inviata. Ti contatteremo se il profilo sara in linea.",
      });
      return;
    }

    turnstile.reset();
    handleTurnstileReset();
    setStatus({ type: "error", message: result.error });
  };

  return (
    <section id="apply" className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className="text-3xl font-black text-white md:text-4xl">
            {siteConfig.sections.applicationTitle}
          </h2>
          <p className="mt-4 leading-8 text-slate-300">
            I dati vengono inviati ai responsabili della community tramite
            Discord. Non salviamo candidature nel sito e non usiamo upload
            diretti in questa versione.
          </p>
        </div>
        <form
          className="rounded-lg border border-line bg-panel p-5 md:p-8"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {status ? (
            <div
              ref={statusRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              className={`mb-6 rounded-md border p-4 text-sm ${
                status.type === "success"
                  ? "border-volt/50 bg-volt/10 text-volt"
                  : "border-red-300/50 bg-red-950/30 text-red-200"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              id="fullName"
              label="Nome e cognome"
              error={errors.fullName?.message}
            >
              <input
                id="fullName"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
                {...register("fullName")}
              />
            </Field>
            <Field
              id="email"
              label="Indirizzo email"
              error={errors.email?.message}
            >
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
            </Field>
            <Field
              id="discordUsername"
              label="Username Discord"
              error={errors.discordUsername?.message}
            >
              <input
                id="discordUsername"
                autoComplete="off"
                aria-invalid={Boolean(errors.discordUsername)}
                aria-describedby={
                  errors.discordUsername ? "discordUsername-error" : undefined
                }
                {...register("discordUsername")}
              />
            </Field>
            <Field
              id="positionId"
              label="Posizione desiderata"
              error={errors.positionId?.message}
            >
              <select
                id="positionId"
                aria-invalid={Boolean(errors.positionId)}
                aria-describedby={
                  errors.positionId ? "positionId-error" : undefined
                }
                {...register("positionId")}
              >
                <option value="">Seleziona</option>
                {openPositions
                  .filter((position) => position.isOpen)
                  .map((position) => (
                    <option key={position.id} value={position.id}>
                      {position.title}
                    </option>
                  ))}
              </select>
            </Field>
            <Field id="age" label="Eta" error={errors.age?.message}>
              <input
                id="age"
                type="number"
                min={siteConfig.minimumAge}
                max={99}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? "age-error" : undefined}
                {...register("age")}
              />
            </Field>
            <Field
              id="weeklyAvailability"
              label="Disponibilita settimanale"
              error={errors.weeklyAvailability?.message}
            >
              <input
                id="weeklyAvailability"
                placeholder="Es. 3 sere a settimana"
                aria-invalid={Boolean(errors.weeklyAvailability)}
                aria-describedby={
                  errors.weeklyAvailability
                    ? "weeklyAvailability-error"
                    : undefined
                }
                {...register("weeklyAvailability")}
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5">
            <Field
              id="experience"
              label="Esperienza"
              error={errors.experience?.message}
            >
              <textarea
                id="experience"
                aria-invalid={Boolean(errors.experience)}
                aria-describedby={
                  errors.experience ? "experience-error" : undefined
                }
                {...register("experience")}
              />
            </Field>
            <Field
              id="motivation"
              label="Motivazione"
              error={errors.motivation?.message}
            >
              <textarea
                id="motivation"
                aria-invalid={Boolean(errors.motivation)}
                aria-describedby={
                  errors.motivation ? "motivation-error" : undefined
                }
                {...register("motivation")}
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field
              id="portfolioUrl"
              label="Portfolio o link utile, facoltativo"
              error={errors.portfolioUrl?.message}
            >
              <input
                id="portfolioUrl"
                type="url"
                aria-invalid={Boolean(errors.portfolioUrl)}
                aria-describedby={
                  errors.portfolioUrl ? "portfolioUrl-error" : undefined
                }
                {...register("portfolioUrl")}
              />
            </Field>
            <Field
              id="cvUrl"
              label="URL del curriculum, facoltativo"
              error={errors.cvUrl?.message}
            >
              <input
                id="cvUrl"
                type="url"
                aria-invalid={Boolean(errors.cvUrl)}
                aria-describedby={errors.cvUrl ? "cvUrl-error" : undefined}
                {...register("cvUrl")}
              />
            </Field>
          </div>

          <input
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            {...register("website")}
          />
          <input type="hidden" {...register("turnstileToken")} />

          <div className="mt-6 space-y-4">
            <label className="flex gap-3 text-sm text-slate-300">
              <input
                className="mt-1 h-4 w-4 shrink-0"
                type="checkbox"
                aria-invalid={Boolean(errors.confirmsMinimumAge)}
                {...register("confirmsMinimumAge")}
              />
              <span>
                Confermo di avere almeno {siteConfig.minimumAge} anni.
              </span>
            </label>
            {errors.confirmsMinimumAge ? (
              <p className="text-sm text-red-300">
                {errors.confirmsMinimumAge.message}
              </p>
            ) : null}

            <label className="flex gap-3 text-sm text-slate-300">
              <input
                className="mt-1 h-4 w-4 shrink-0"
                type="checkbox"
                aria-invalid={Boolean(errors.privacyConsent)}
                {...register("privacyConsent")}
              />
              <span>
                Ho letto la privacy policy e acconsento all invio dei dati ai
                responsabili della community tramite Discord.
              </span>
            </label>
            {errors.privacyConsent ? (
              <p className="text-sm text-red-300">
                {errors.privacyConsent.message}
              </p>
            ) : null}
          </div>

          <div className="mt-6">
            {siteKey ? (
              <div ref={turnstile.containerRef} />
            ) : (
              <p className="text-sm text-red-300">
                Configura VITE_TURNSTILE_SITE_KEY per abilitare la verifica.
              </p>
            )}
            {errors.turnstileToken ? (
              <p className="mt-2 text-sm text-red-300">
                {errors.turnstileToken.message}
              </p>
            ) : null}
          </div>

          <Button
            className="mt-7 w-full sm:w-auto"
            type="submit"
            disabled={isSubmitting}
          >
            <Send aria-hidden="true" size={18} />
            {isSubmitting ? "Invio in corso..." : "Invia candidatura"}
          </Button>
        </form>
      </div>
    </section>
  );
}
