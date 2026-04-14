import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { extractTextFromPdf } from "@/utils/pdfParser";
import { db } from "@/utils/db/db";
import { rawResumes } from "@/utils/db/schema";
import { extractKeywords } from "@/utils/extractKeywords";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { addRawResume, createResume } from '@/utils/db/resumes';

export function ResumePdfUpload() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedText, setParsedText] = useState<string>("");
  const [previewKeywords, setPreviewKeywords] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setIsParsing(true);
      
      if (!fileName.trim()) {
        setFileName(file.name.replace('.pdf', ''));
      }

      try {
        const text = await extractTextFromPdf(file);
        setParsedText(text);
        
        const keywordMap = extractKeywords(text);
        const sortedKeywords = Array.from(keywordMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([word]) => word);
          
        setPreviewKeywords(sortedKeywords);
        toast.success("PDF parsed! Review the detected keywords below.");
      } catch (error) {
        console.error("PDF Parsing error:", error);
        toast.error("Failed to read the PDF file.");
      } finally {
        setIsParsing(false);
      }
    }
  };


  async function handleSave() {
    try {
      const json = textToJsonResume(parsedText);
      const chosenName = fileName.trim() || json?.basics?.name?.trim() || "Pasted Resume";

      const saved = await createResume({ name: chosenName, json });
      await addRawResume({ name: chosenName, rawText: parsedText, source: "paste", jsonId: saved.id });

      toast.success("Pasted resume saved!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save pasted resume.");
    }
  }



  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload PDF Resume</h3>

        <div className="space-y-3">
          <Label htmlFor="resume-name">
            Resume Name <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="resume-name"
            placeholder="SWE Resume 2026"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="resume-file">
            PDF File <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="resume-file"
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            disabled={isParsing}
          />
        </div>
      </div>

      {isParsing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          Parsing PDF content...
        </div>
      )}

      {previewKeywords.length > 0 && (
        <div className="space-y-4 border-t pt-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Detected Keywords ({previewKeywords.length})
            </h4>
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={!fileName.trim()} 
            >
              Save Resume
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded-md">
            {previewKeywords.map((word, i) => (
              <Badge key={i} variant="secondary" className="font-normal">
                {word}
              </Badge>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground italic">
            These keywords will be used to calculate match scores against job descriptions.
          </p>
        </div>
      )}
    </div>
  );
}