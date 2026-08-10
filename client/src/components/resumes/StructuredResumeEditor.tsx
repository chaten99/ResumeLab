import React, { useState } from "react";
import {
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Wand2,
  Plus,
  Trash2,
  Save,
  Eye,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StructuredResumeData } from "../templates/types";

interface StructuredResumeEditorProps {
  initialData: StructuredResumeData;
  rawTranscript?: string;
  onSave: (data: StructuredResumeData) => Promise<void>;
  onRetriggerExtraction: () => Promise<void>;
  onContinue: () => void;
  isSaving?: boolean;
  isExtracting?: boolean;
}

export const StructuredResumeEditor: React.FC<StructuredResumeEditorProps> = ({
  initialData,
  rawTranscript,
  onSave,
  onRetriggerExtraction,
  onContinue,
  isSaving = false,
  isExtracting = false,
}) => {
  const [data, setData] = useState<StructuredResumeData>(initialData);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);

  const contact = data.contact || {};
  const skills = data.skills || { technicalSkills: [], softSkills: [], tools: [], languages: [] };
  const experience = data.experience || [];
  const projects = data.projects || [];

  const handleContactChange = (field: string, val: string) => {
    setData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: val,
      },
    }));
  };

  const handleAddExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        { title: "New Position", company: "Company Name", startDate: "", endDate: "", current: false, bullets: ["Key achievement or responsibility"] },
      ],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { title: "New Project", description: "Brief project overview...", techStack: ["React", "Node.js"], bullets: [] },
      ],
    }));
  };

  const handleRemoveProject = (index: number) => {
    setData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddSkill = (skill: string) => {
    if (!skill.trim()) return;
    setData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technicalSkills: [...(prev.skills?.technicalSkills || []), skill.trim()],
      },
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technicalSkills: (prev.skills?.technicalSkills || []).filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-primary" /> Step 2: Review Structured Resume Details
          </h2>
          <p className="text-xs text-muted-foreground max-w-xl">
            AI has extracted professional details from your self-introduction. Review and edit every section below.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {rawTranscript && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscriptDialog(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <FileText className="size-3.5" /> Show Spoken Transcript
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRetriggerExtraction}
            disabled={isExtracting}
            className="text-xs font-bold gap-1.5"
          >
            <Wand2 className={`size-3.5 ${isExtracting ? "animate-spin" : ""}`} /> Re-extract AI
          </Button>

          <Button
            size="sm"
            onClick={() => onSave(data)}
            disabled={isSaving}
            className="font-bold text-xs gap-1.5 shadow-md"
          >
            <Save className="size-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-xs text-foreground border-b border-border pb-2">
            <User className="size-4 text-primary" /> Personal &amp; Contact Details
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-[11px]">Full Name</Label>
              <Input
                value={contact.fullName || ""}
                onChange={(e) => handleContactChange("fullName", e.target.value)}
                placeholder="John Doe"
                className="text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-[11px]">Email</Label>
              <Input
                value={contact.email || ""}
                onChange={(e) => handleContactChange("email", e.target.value)}
                placeholder="john@example.com"
                className="text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-[11px]">Phone</Label>
              <Input
                value={contact.phone || ""}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                placeholder="+1 234 567 890"
                className="text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-[11px]">Location</Label>
              <Input
                value={contact.location || ""}
                onChange={(e) => handleContactChange("location", e.target.value)}
                placeholder="San Francisco, CA"
                className="text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-[11px]">LinkedIn</Label>
              <Input
                value={contact.linkedin || ""}
                onChange={(e) => handleContactChange("linkedin", e.target.value)}
                placeholder="linkedin.com/in/username"
                className="text-xs h-8"
              />
            </div>
            <div>
              <Label className="text-[11px]">GitHub</Label>
              <Input
                value={contact.github || ""}
                onChange={(e) => handleContactChange("github", e.target.value)}
                placeholder="github.com/username"
                className="text-xs h-8"
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-foreground border-b border-border pb-2">
            <Sparkles className="size-4 text-primary" /> Professional Summary
          </div>
          <Textarea
            value={data.summary || ""}
            onChange={(e) => setData({ ...data, summary: e.target.value })}
            placeholder="AI extracted professional summary will appear here..."
            className="min-h-[100px] text-xs p-3 leading-relaxed"
          />
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <Briefcase className="size-4 text-primary" /> Work Experience
            </div>
            <Button size="sm" variant="outline" onClick={handleAddExperience} className="text-xs h-7 gap-1">
              <Plus className="size-3" /> Add Experience
            </Button>
          </div>

          {experience.map((exp, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3 relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveExperience(idx)}
                className="absolute top-2 right-2 text-destructive size-7 p-0"
              >
                <Trash2 className="size-3.5" />
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pr-8">
                <div>
                  <Label className="text-[11px]">Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].title = e.target.value;
                      setData({ ...data, experience: updated });
                    }}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].company = e.target.value;
                      setData({ ...data, experience: updated });
                    }}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Start Date</Label>
                  <Input
                    value={exp.startDate || ""}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].startDate = e.target.value;
                      setData({ ...data, experience: updated });
                    }}
                    placeholder="e.g. Jan 2022"
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">End Date</Label>
                  <Input
                    value={exp.endDate || ""}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[idx].endDate = e.target.value;
                      setData({ ...data, experience: updated });
                    }}
                    placeholder="e.g. Present"
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <FolderGit2 className="size-4 text-primary" /> Key Projects
            </div>
            <Button size="sm" variant="outline" onClick={handleAddProject} className="text-xs h-7 gap-1">
              <Plus className="size-3" /> Add Project
            </Button>
          </div>

          {projects.map((proj, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3 relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveProject(idx)}
                className="absolute top-2 right-2 text-destructive size-7 p-0"
              >
                <Trash2 className="size-3.5" />
              </Button>

              <div className="space-y-2 pr-8">
                <div>
                  <Label className="text-[11px]">Project Title</Label>
                  <Input
                    value={proj.title}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[idx].title = e.target.value;
                      setData({ ...data, projects: updated });
                    }}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Description</Label>
                  <Textarea
                    value={proj.description}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[idx].description = e.target.value;
                      setData({ ...data, projects: updated });
                    }}
                    className="text-xs min-h-[60px] p-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <div className="flex items-center gap-2 font-bold text-xs text-foreground border-b border-border pb-2">
            <GraduationCap className="size-4 text-primary" /> Technical Skills &amp; Tools
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.technicalSkills?.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs gap-1 py-1 px-2.5">
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="text-muted-foreground hover:text-destructive text-[10px]"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 max-w-sm">
            <Input
              id="newSkillInput"
              placeholder="Add skill (e.g. React, TypeScript)..."
              className="text-xs h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4">
        <Button size="sm" onClick={onContinue} className="font-bold text-xs gap-1.5 shadow-md">
          <span>Continue to Step 3 (Choose Resume Template)</span>
          <Eye className="size-4" />
        </Button>
      </div>

      <Dialog open={showTranscriptDialog} onOpenChange={setShowTranscriptDialog}>
        <DialogContent className="sm:max-w-xl font-sans p-6 bg-card border-border shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="size-5 text-primary" /> Raw Spoken Transcript (Hidden Context)
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground">
            This is the verbatim transcript produced by speech-to-text. It is stored as AI source context and hidden from your final resume.
          </p>

          <div className="p-4 rounded-xl bg-muted/20 border border-border min-h-[140px] max-h-[300px] overflow-y-auto text-xs leading-relaxed font-mono whitespace-pre-wrap">
            {rawTranscript}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
