package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.dto.request.DocumentoRequestDTO;
import sifeo.tcc.models.dto.response.DocumentoResponseDTO;
import sifeo.tcc.models.entities.*;
import sifeo.tcc.repository.*;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final SitioService sitioService;
    private final CategoriaRepository categoriaRepository;
    private final SetorRepository setorRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final InsumoRepository insumoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final HistoricoAtividadeRepository atividadeRepository;

    public DocumentoService(
            DocumentoRepository documentoRepository,
            SitioService sitioService,
            CategoriaRepository categoriaRepository,
            SetorRepository setorRepository,
            EquipamentoRepository equipamentoRepository,
            InsumoRepository insumoRepository,
            FuncionarioRepository funcionarioRepository,
            HistoricoAtividadeRepository atividadeRepository) {
        this.documentoRepository = documentoRepository;
        this.sitioService = sitioService;
        this.categoriaRepository = categoriaRepository;
        this.setorRepository = setorRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.insumoRepository = insumoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.atividadeRepository = atividadeRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponseDTO> listarPorSitio(Integer sitioId) {
        sitioService.buscarSitioSeguro(sitioId);
        return documentoRepository.findBySitioId(sitioId).stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentoResponseDTO cadastrar(DocumentoRequestDTO dto) {
        if (dto.getArquivoBase64() == null || dto.getArquivoBase64().isBlank()) {
            throw new RegraNegocioException("É obrigatório anexar um arquivo ao cadastrar um documento.");
        }

        Documento documento = new Documento();
        preencherVinculosEDados(documento, dto);
        aplicarArquivo(documento, dto);

        Documento salvo = documentoRepository.save(documento);
        return mapearParaDTO(salvo);
    }

    @Transactional
    public DocumentoResponseDTO atualizar(Integer id, DocumentoRequestDTO dto) {
        Documento documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado com o ID informado."));
        sitioService.validarPropriedadeDoUsuario(documento.getSitio());

        preencherVinculosEDados(documento, dto);

        if (dto.getArquivoBase64() != null && !dto.getArquivoBase64().isBlank()) {
            aplicarArquivo(documento, dto);
        }

        Documento atualizado = documentoRepository.save(documento);
        return mapearParaDTO(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        Documento documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado para exclusão."));
        sitioService.validarPropriedadeDoUsuario(documento.getSitio());
        documentoRepository.delete(documento);
    }

    @Transactional(readOnly = true)
    public Documento buscarParaDownload(Integer id) {
        Documento documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado com o ID informado."));
        sitioService.validarPropriedadeDoUsuario(documento.getSitio());

        if (documento.getArquivo() == null || documento.getArquivo().length == 0) {
            throw new RecursoNaoEncontradoException("Este documento não possui um arquivo anexado.");
        }
        return documento;
    }

    private void preencherVinculosEDados(Documento documento, DocumentoRequestDTO dto) {
        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada com o ID informado."));

        documento.setSitio(sitio);
        documento.setCategoria(categoria);
        documento.setNome(dto.getNome());
        documento.setDescricao(dto.getDescricao());
        documento.setDataAdicionado(dto.getDataAdicionado());
        documento.setReceitaDespesa(dto.isReceitaDespesa());
        documento.setValor(dto.getValor());

        documento.setSetor(null);
        documento.setEquipamento(null);
        documento.setInsumo(null);
        documento.setFuncionario(null);
        documento.setAtividade(null);

        String tipoVinculo = dto.getTipoVinculo();
        if (tipoVinculo == null || tipoVinculo.isBlank()) {
            return;
        }

        if (dto.getVinculoId() == null) {
            throw new RegraNegocioException("Informe o registro a ser vinculado ao documento.");
        }

        switch (tipoVinculo.toUpperCase()) {
            case "SETOR" -> {
                Setor setor = setorRepository.findById(dto.getVinculoId())
                        .orElseThrow(() -> new RecursoNaoEncontradoException("Setor não encontrado com o ID informado."));
                validarMesmaPropriedade(setor.getSitio().getId(), sitio.getId());
                documento.setSetor(setor);
            }
            case "EQUIPAMENTO" -> {
                Equipamento equipamento = equipamentoRepository.findById(dto.getVinculoId())
                        .orElseThrow(() -> new RecursoNaoEncontradoException("Equipamento não encontrado com o ID informado."));
                validarMesmaPropriedade(equipamento.getSitio().getId(), sitio.getId());
                documento.setEquipamento(equipamento);
            }
            case "INSUMO" -> {
                Insumo insumo = insumoRepository.findById(dto.getVinculoId())
                        .orElseThrow(() -> new RecursoNaoEncontradoException("Insumo não encontrado com o ID informado."));
                validarMesmaPropriedade(insumo.getSitio().getId(), sitio.getId());
                documento.setInsumo(insumo);
            }
            case "FUNCIONARIO" -> {
                Funcionario funcionario = funcionarioRepository.findById(dto.getVinculoId())
                        .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado com o ID informado."));
                validarMesmaPropriedade(funcionario.getSitio().getId(), sitio.getId());
                documento.setFuncionario(funcionario);
            }
            case "ATIVIDADE" -> {
                HistoricoAtividade atividade = atividadeRepository.findById(dto.getVinculoId())
                        .orElseThrow(() -> new RecursoNaoEncontradoException("Atividade não encontrada com o ID informado."));
                validarMesmaPropriedade(atividade.getSitio().getId(), sitio.getId());
                documento.setAtividade(atividade);
            }
            default -> throw new IllegalArgumentException("Tipo de vínculo inválido: " + tipoVinculo);
        }
    }

    private void validarMesmaPropriedade(Integer sitioIdDoVinculo, Integer sitioIdInformado) {
        if (!sitioIdDoVinculo.equals(sitioIdInformado)) {
            throw new RegraNegocioException("O registro vinculado não pertence à propriedade selecionada.");
        }
    }

    private void aplicarArquivo(Documento documento, DocumentoRequestDTO dto) {
        byte[] arquivo = Base64.getDecoder().decode(dto.getArquivoBase64());
        documento.setArquivo(arquivo);
        documento.setNomeArquivo(dto.getNomeArquivo());
        documento.setTipoArquivo(dto.getTipoArquivo());
    }

    private DocumentoResponseDTO mapearParaDTO(Documento documento) {
        DocumentoResponseDTO dto = new DocumentoResponseDTO();
        dto.setId(documento.getId());
        dto.setNome(documento.getNome());
        dto.setDescricao(documento.getDescricao());
        dto.setDataAdicionado(documento.getDataAdicionado());
        dto.setReceitaDespesa(documento.isReceitaDespesa());
        dto.setValor(documento.getValor());
        dto.setNomeArquivo(documento.getNomeArquivo());
        dto.setTipoArquivo(documento.getTipoArquivo());
        dto.setTamanhoArquivoBytes(documento.getArquivo() != null ? documento.getArquivo().length : 0);

        if (documento.getCategoria() != null) {
            dto.setCategoriaId(documento.getCategoria().getId());
            dto.setCategoriaNome(documento.getCategoria().getNome());
        }

        if (documento.getSitio() != null) {
            dto.setSitioId(documento.getSitio().getId());
            dto.setNomePropriedade(documento.getSitio().getNome());
        }

        if (documento.getSetor() != null) {
            dto.setTipoVinculo("SETOR");
            dto.setVinculoId(documento.getSetor().getId());
            dto.setVinculoNome(documento.getSetor().getNome());
        } else if (documento.getEquipamento() != null) {
            dto.setTipoVinculo("EQUIPAMENTO");
            dto.setVinculoId(documento.getEquipamento().getId());
            dto.setVinculoNome(documento.getEquipamento().getNome());
        } else if (documento.getInsumo() != null) {
            dto.setTipoVinculo("INSUMO");
            dto.setVinculoId(documento.getInsumo().getId());
            dto.setVinculoNome(documento.getInsumo().getNome());
        } else if (documento.getFuncionario() != null) {
            dto.setTipoVinculo("FUNCIONARIO");
            dto.setVinculoId(documento.getFuncionario().getId());
            dto.setVinculoNome(documento.getFuncionario().getNomeCompleto());
        } else if (documento.getAtividade() != null) {
            dto.setTipoVinculo("ATIVIDADE");
            dto.setVinculoId(documento.getAtividade().getId());
            dto.setVinculoNome(documento.getAtividade().getDescricao());
        }

        return dto;
    }
}
