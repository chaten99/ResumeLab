import React from "react";
import type { TemplateId, ColorTheme, StructuredResumeData } from "./types";
import { MinimalTemplate } from "./MinimalTemplate";
import { ModernTemplate } from "./ModernTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";
import { AtsFriendlyTemplate } from "./AtsFriendlyTemplate";
import { CreativeTemplate } from "./CreativeTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";

interface TemplateRendererProps {
  templateId: TemplateId;
  colorTheme?: ColorTheme;
  data: StructuredResumeData;
  targetRole?: string;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  templateId,
  colorTheme = "indigo",
  data,
  targetRole,
}) => {
  switch (templateId) {
    case "minimal":
      return <MinimalTemplate data={data} colorTheme={colorTheme} targetRole={targetRole} />;
    case "modern":
      return <ModernTemplate data={data} colorTheme={colorTheme} targetRole={targetRole} />;
    case "professional":
      return <ProfessionalTemplate data={data} colorTheme={colorTheme} targetRole={targetRole} />;
    case "ats":
      return <AtsFriendlyTemplate data={data} colorTheme={colorTheme} targetRole={targetRole} />;
    case "creative":
      return <CreativeTemplate data={data} colorTheme={colorTheme} targetRole={targetRole} />;
    case "executive":
      return <ExecutiveTemplate data={data} colorTheme={colorTheme} targetRole={targetRole} />;
    default:
      return <ModernTemplate data={data} colorTheme={colorTheme} targetRole={targetRole} />;
  }
};
