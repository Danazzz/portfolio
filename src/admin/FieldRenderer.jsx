import { BilingualField, ImageField, SelectInput, TextArea, TextInput } from "./fields";
import { getTr, setTr } from "./form-utils";
import { cn } from "../lib/utils";

/** Menampilkan daftar isian berdasarkan konfigurasi (lihat collections.js). */
export function FieldRenderer({ fields, value, onChange, folder, errors = {} }) {
  const set = (name, v) => onChange({ ...value, [name]: v });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const common = {
          label: f.label,
          help: f.help,
          required: f.required,
          error: errors[f.name],
          placeholder: f.placeholder,
        };
        let input;
        if (f.translatable) {
          input = (
            <BilingualField
              {...common}
              kind={f.type}
              rows={f.rows || 5}
              value={value[f.name]}
              onChange={(v) => set(f.name, v)}
              valueId={getTr(value, f.name)}
              onChangeId={(v) => onChange(setTr(value, f.name, v))}
            />
          );
        } else if (f.type === "textarea") {
          input = <TextArea {...common} rows={f.rows || 5} value={value[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} />;
        } else if (f.type === "lines") {
          input = (
            <TextArea
              {...common}
              rows={5}
              value={(value[f.name] || []).join("\n")}
              onChange={(e) => set(f.name, e.target.value.split("\n"))}
            />
          );
        } else if (f.type === "select") {
          input = (
            <SelectInput {...common} value={value[f.name] || ""} onChange={(e) => set(f.name, e.target.value)}>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectInput>
          );
        } else if (f.type === "image") {
          input = (
            <ImageField
              label={f.label}
              help={f.help}
              aspect={f.aspect}
              folder={folder}
              value={value[f.name] || ""}
              onChange={(url) => set(f.name, url)}
            />
          );
        } else {
          const listId = f.options ? `options-${f.name}` : undefined;
          input = (
            <>
              <TextInput
                {...common}
                type={f.type === "url" ? "url" : f.type === "email" ? "email" : "text"}
                list={listId}
                value={value[f.name] || ""}
                onChange={(e) => set(f.name, e.target.value)}
              />
              {f.options && (
                <datalist id={listId}>
                  {f.options.map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              )}
            </>
          );
        }
        return (
          <div key={f.name} className={cn(!f.half && "sm:col-span-2")}>
            {input}
          </div>
        );
      })}
    </div>
  );
}
