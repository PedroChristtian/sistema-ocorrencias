import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import api from "@/api/axios";
import type { Categoria, Ocorrencia, Prioridade } from "@/types";

const TRANSICOES: Record<string, string[]> = {
  Aberta: ["Em Analise", "Cancelada"],
  "Em Analise": ["Em Andamento"],
  "Em Andamento": ["Resolvida"],
  Resolvida: ["Fechada"],
  Fechada: [],
  Cancelada: [],
};

function validarCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  for (let i = 9; i < 11; i++) {
    let soma = 0;
    for (let j = 0; j < i; j++) {
      soma += Number(digits[j]) * (i + 1 - j);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(digits[i])) return false;
  }
  return true;
}

const formSchema = z.object({
  cpf_cidadao: z.string().optional(),
  categoria_id: z.number({ required_error: "Categoria obrigatoria" }).min(1),
  prioridade_id: z.number({ required_error: "Prioridade obrigatoria" }).min(1),
  descricao: z.string().min(1, "Descricao obrigatoria").max(2000),
  status: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OcorrenciaFormProps {
  ocorrencia: Ocorrencia | null;
  categorias: Categoria[];
  prioridades: Prioridade[];
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export default function OcorrenciaForm({
  ocorrencia,
  categorias,
  prioridades,
  onSuccess,
  onError,
}: OcorrenciaFormProps) {
  const isEdit = !!ocorrencia;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          cpf_cidadao: ocorrencia.cpf_cidadao,
          categoria_id: ocorrencia.categoria_id,
          prioridade_id: ocorrencia.prioridade_id,
          descricao: ocorrencia.descricao,
          status: ocorrencia.status,
        }
      : {
          cpf_cidadao: "",
          categoria_id: undefined as unknown as number,
          prioridade_id: undefined as unknown as number,
          descricao: "",
          status: undefined,
        },
  });

  const onSubmit = async (data: FormData) => {
    if (!isEdit && data.cpf_cidadao && !validarCpf(data.cpf_cidadao)) {
      onError("CPF invalido");
      return;
    }

    try {
      if (isEdit) {
        const payload: Record<string, unknown> = {};
        if (data.descricao !== ocorrencia.descricao)
          payload.descricao = data.descricao;
        if (data.categoria_id !== ocorrencia.categoria_id)
          payload.categoria_id = data.categoria_id;
        if (data.prioridade_id !== ocorrencia.prioridade_id)
          payload.prioridade_id = data.prioridade_id;
        if (data.status !== ocorrencia.status) payload.status = data.status;
        await api.put(`/ocorrencias/${ocorrencia.id}`, payload);
      } else {
        await api.post("/ocorrencias/", {
          cpf_cidadao: data.cpf_cidadao,
          categoria_id: data.categoria_id,
          prioridade_id: data.prioridade_id,
          descricao: data.descricao,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      onError(axiosErr.response?.data?.detail ?? "Erro ao salvar ocorrencia");
    }
  };

  const statusOptions = isEdit ? (TRANSICOES[ocorrencia.status] ?? []) : [];

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      {!isEdit && (
        <TextField
          label="CPF do Cidadao"
          {...register("cpf_cidadao")}
          error={!!errors.cpf_cidadao}
          helperText={errors.cpf_cidadao?.message}
          placeholder="00000000000"
          slotProps={{ htmlInput: { maxLength: 14 } }}
          fullWidth
        />
      )}

      <Controller
        name="categoria_id"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.categoria_id}>
            <InputLabel>Categoria</InputLabel>
            <Select
              {...field}
              value={field.value ?? ""}
              label="Categoria"
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {categorias.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nome}
                </MenuItem>
              ))}
            </Select>
            {errors.categoria_id && (
              <FormHelperText>{errors.categoria_id.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <Controller
        name="prioridade_id"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.prioridade_id}>
            <InputLabel>Prioridade</InputLabel>
            <Select
              {...field}
              value={field.value ?? ""}
              label="Prioridade"
              onChange={(e) => field.onChange(Number(e.target.value))}
            >
              {prioridades.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.nome}
                </MenuItem>
              ))}
            </Select>
            {errors.prioridade_id && (
              <FormHelperText>{errors.prioridade_id.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <TextField
        label="Descricao"
        multiline
        rows={4}
        {...register("descricao")}
        error={!!errors.descricao}
        helperText={errors.descricao?.message}
        fullWidth
      />

      {isEdit && statusOptions.length > 0 && (
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select {...field} label="Status">
                <MenuItem value={ocorrencia.status}>
                  {ocorrencia.status} (atual)
                </MenuItem>
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      )}

      <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
        {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
      </Button>
    </Box>
  );
}
