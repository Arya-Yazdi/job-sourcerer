import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ResumePasteForm from "@/components/external-resume-upload.tsx";
import { concatResumeFields } from "@/utils/concatResumeFields.ts";
import { createResume, addRawResume } from "@/utils/db/resumes";
import { ResumeSchema } from '@/utils/db/schema.ts';
import { ResumePdfUpload } from "./resume-pdf-upload";

export function ResumeForm() {
  const [recordName, setRecordName] = useState(""); // <-- hook at top level

  const form = useForm<z.infer<typeof ResumeSchema>>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(ResumeSchema),
    defaultValues: {
      basics: {
        name: "",
        label: "",
        email: "",
        phone: "",
        website: "",
        summary: "",
        profiles: [{ network: "", username: "", url: "" }],
      },
      education: [
        {
          institution: "",
          area: "",
          startDate: "",
          endDate: "",
        },
      ],
      work: [
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          summary: "",
        },
      ],
      projects: [
        {
          name: "",
          startDate: "",
          endDate: "",
          description: "",
          url: "",
        },
      ],
    },
  });

  const { fields: educationFields } = useFieldArray({
    control: form.control,
    name: "education",
  });
  const { fields: workFields } = useFieldArray({
    control: form.control,
    name: "work",
  });
  const { fields: projectFields } = useFieldArray({
    control: form.control,
    name: "projects",
  });
  const {
    fields: profileFields,
    append: appendProfile,
    remove: removeProfile,
  } = useFieldArray({
    control: form.control,
    name: "basics.profiles",
  });

  // Single, top-level submit handler
  async function onSubmit(data: z.infer<typeof ResumeSchema>) {
    try {
      const chosenName =
        recordName.trim() ||
        data?.basics?.name?.trim() ||
        "Untitled Resume";

      const saved = await createResume({ name: chosenName, json: data });

      const rawText = concatResumeFields(data);
      await addRawResume({
        name: chosenName,
        rawText,
        source: "builder",
        jsonId: saved.id, // integer id from PGlite/Drizzle
      });

      toast.success("Resume saved successfully!");
    } catch (e) {
      console.error("Error saving resume:", e);
      toast.error("Failed to save resume.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium">Resume Name</label>
          <input
            className="mt-1 w-full rounded border p-2"
            placeholder="e.g. SWE – Fall ’25 (ATS-optimized)"
            value={recordName}
            onChange={(e) => setRecordName(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-8 overflow-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basics.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mark Zuckerberg (REQUIRED)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basics.label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Developer (REQUIRED)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basics.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="mz@yahoo.com (REQUIRED)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basics.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="111-111-2233 (REQUIRED)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basics.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com (REQUIRED)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="basics.summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Social Profiles</h2>
              {profileFields.map((item, index) => (
                <div key={item.id} className="border p-4 rounded-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`basics.profiles.${index}.network`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Network</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. LinkedIn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`basics.profiles.${index}.username`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. edinramovic" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`basics.profiles.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="button" variant="destructive" onClick={() => removeProfile(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => appendProfile({ network: "", username: "", url: "" })}
              >
                Add Profile
              </Button>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Education</h2>
              {educationFields.map((item, index) => (
                <div key={item.id} className="border p-4 rounded-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input placeholder="Arizona State University (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.area`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Study</FormLabel>
                          <FormControl>
                            <Input placeholder="BS in Computer Science (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="YYYY-MM-DD (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`education.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input placeholder="YYYY-MM-DD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Work Experience</h2>
              {workFields.map((item, index) => (
                <div key={item.id} className="border p-4 rounded-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`work.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Meta (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="Software Developer (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="YYYY-MM-DD (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`work.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input placeholder="YYYY-MM-DD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`work.${index}.summary`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Projects</h2>
              {projectFields.map((item, index) => (
                <div key={item.id} className="border p-4 rounded-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`projects.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Job Sourcerer (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input placeholder="http://github.com (REQUIRED)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input placeholder="YYYY-MM-DD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`projects.${index}.endDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input placeholder="YYYY-MM-DD" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`projects.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="(REQUIRED)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="mt-8 block mx-auto">
          Save
        </Button>
      </form>
    </Form>
  );
}

export function ResumeUpload() {
  const [mode, setMode] = useState<"builder" | "paste" | "pdf">("builder");
  const base =
    "px-4 py-2 text-sm font-medium rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const active =
    "bg-black text-white border-black dark:bg-white dark:text-zinc-900 dark:border-white shadow";
  const inactive =
    "bg-white text-zinc-900 border-zinc-300 hover:bg-zinc-50 " +
    "dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800";

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Resume</h1>

      <div className="inline-flex rounded-full p-1 bg-transparent gap-2">
        <button
          type="button"
          aria-pressed={mode === "builder"}
          onClick={() => setMode("builder")}
          className={`${base} ${mode === "builder" ? active : inactive}`}
        >
          Build (JSON Resume)
        </button>

        <button
          type="button"
          aria-pressed={mode === "paste"}
          onClick={() => setMode("paste")}
          className={`${base} ${mode === "paste" ? active : inactive}`}
        >
          Paste Text
        </button>

        <button
          type="button"
          aria-pressed={mode === "pdf"}
          onClick={() => setMode("pdf")}
          className={`${base} ${mode === "pdf" ? active : inactive}`}
        >
          Upload PDF
        </button>
      </div>

      <div className="mt-4">
        {mode === "builder" && <ResumeForm />}
        {mode === "paste" && <ResumePasteForm />}
        {mode === "pdf" && <ResumePdfUpload />}
      </div>
    </div>
  );
}