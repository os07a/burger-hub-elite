import { Eye } from "lucide-react";
import {
  type MetaTemplate,
  getHeaderText,
  getFooterText,
  renderTemplateBody,
} from "@/lib/templateUtils";

interface Props {
  template: MetaTemplate;
  parameters: string[];
}

const TemplatePreviewBubble = ({ template, parameters }: Props) => {
  const header = getHeaderText(template);
  const body = renderTemplateBody(template, parameters);
  const footer = getFooterText(template);
  const buttons = template.components?.find((c) => c.type === "BUTTONS")?.buttons ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
        <Eye className="h-3 w-3" />
        معاينة حية
      </div>
      <div className="rounded-lg bg-[#dcf8c6] dark:bg-[#005c4b] border border-[#c5e8b3] dark:border-[#004d3e] p-3 shadow-sm space-y-1.5">
        {header && (
          <div className="text-[11px] font-bold text-foreground">{header}</div>
        )}
        <div className="text-[12px] whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {body}
        </div>
        {footer && (
          <div className="text-[10px] text-muted-foreground italic pt-1">
            {footer}
          </div>
        )}
        {buttons.length > 0 && (
          <div className="pt-1.5 mt-1 border-t border-[#c5e8b3] dark:border-[#004d3e] space-y-1">
            {buttons.map((b, i) => (
              <div
                key={i}
                className="text-center text-[11px] font-medium text-blue-700 dark:text-blue-300 py-1"
              >
                {b.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePreviewBubble;