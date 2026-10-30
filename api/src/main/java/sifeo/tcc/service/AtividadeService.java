package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.dto.request.AtividadeRequestDTO;
import sifeo.tcc.models.dto.response.AtividadeResponseDTO;
import sifeo.tcc.models.entities.*;
import sifeo.tcc.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AtividadeService {

    private final HistoricoAtividadeRepository atividadeRepository;
    private final SetorRepository setorRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final TipoAtividadeRepository tipoAtividadeRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final SitioService sitioService;
    private final AutenticacaoService autenticacaoService;

    public AtividadeService(
            HistoricoAtividadeRepository atividadeRepository,
            SetorRepository setorRepository,
            FuncionarioRepository funcionarioRepository,
            TipoAtividadeRepository tipoAtividadeRepository,
            EquipamentoRepository equipamentoRepository,
            SitioService sitioService,
            AutenticacaoService autenticacaoService) {
        this.atividadeRepository = atividadeRepository;
        this.setorRepository = setorRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.tipoAtividadeRepository = tipoAtividadeRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.sitioService = sitioService;
        this.autenticacaoService = autenticacaoService;
    }

    @Transactional(readOnly = true)
    public List<AtividadeResponseDTO> listarTodos(Integer sitioId) {
        List<HistoricoAtividade> atividades;
        if (sitioId != null) {
            sitioService.buscarSitioSeguro(sitioId);
            atividades = atividadeRepository.findBySitioId(sitioId);
        } else {
            Integer usuarioId = autenticacaoService.usuarioLogado().getId();
            atividades = atividadeRepository.findBySitio_Usuario_Id(usuarioId);
        }

        return atividades.stream().map(this::mapearParaDTO).collect(Collectors.toList());
    }

    @Transactional
    public AtividadeResponseDTO cadastrar(AtividadeRequestDTO dto) {
        HistoricoAtividade atividade = new HistoricoAtividade();
        preencherEValidadeEntidade(atividade, dto);
        HistoricoAtividade salva = atividadeRepository.save(atividade);
        return mapearParaDTO(salva);
    }

    @Transactional
    public AtividadeResponseDTO atualizar(Integer id, AtividadeRequestDTO dto) {
        HistoricoAtividade atividade = atividadeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atividade não encontrada."));
        sitioService.validarPropriedadeDoUsuario(atividade.getSitio());

        preencherEValidadeEntidade(atividade, dto);

        HistoricoAtividade atualizada = atividadeRepository.save(atividade);
        return mapearParaDTO(atualizada);
    }

    @Transactional
    public void deletar(Integer id) {
        HistoricoAtividade atividade = atividadeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atividade não encontrada para exclusão."));
        sitioService.validarPropriedadeDoUsuario(atividade.getSitio());
        atividadeRepository.delete(atividade);
    }

    private void preencherEValidadeEntidade(HistoricoAtividade atividade, AtividadeRequestDTO dto) {
        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        Setor setor = setorRepository.findById(dto.getSetorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Setor não encontrado."));
        validarMesmaPropriedade(setor.getSitio().getId(), sitio.getId(), "Setor");

        TipoAtividade tipo = tipoAtividadeRepository.findById(dto.getTipoAtividadeId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de Atividade não encontrado."));
        validarMesmaPropriedade(tipo.getSitio().getId(), sitio.getId(), "Tipo de Atividade");

        Funcionario responsavel = funcionarioRepository.findById(dto.getResponsavelId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário responsável não encontrado."));
        validarMesmaPropriedade(responsavel.getSitio().getId(), sitio.getId(), "Funcionário responsável");

        atividade.setSitio(sitio);
        atividade.setSetor(setor);
        atividade.setTipoAtividade(tipo);
        atividade.setResponsavel(responsavel);
        atividade.setDataAtividade(dto.getDataAtividade());
        atividade.setStatus(dto.getStatus());
        atividade.setDescricao(dto.getDescricao());

        if (dto.getEquipamentoId() != null) {
            Equipamento eq = equipamentoRepository.findById(dto.getEquipamentoId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Equipamento não encontrado."));
            validarMesmaPropriedade(eq.getSitio().getId(), sitio.getId(), "Equipamento");
            atividade.setEquipamento(eq);
        } else {
            atividade.setEquipamento(null);
        }
    }

    private void validarMesmaPropriedade(Integer sitioIdDoVinculo, Integer sitioIdInformado, String nomeDoVinculo) {
        if (!sitioIdDoVinculo.equals(sitioIdInformado)) {
            throw new RegraNegocioException(nomeDoVinculo + " informado não pertence à propriedade selecionada.");
        }
    }

    private AtividadeResponseDTO mapearParaDTO(HistoricoAtividade atividade) {
        AtividadeResponseDTO dto = new AtividadeResponseDTO();
        dto.setId(atividade.getId());
        dto.setDataAtividade(atividade.getDataAtividade());
        dto.setStatus(atividade.getStatus());
        dto.setDescricao(atividade.getDescricao());

        if (atividade.getTipoAtividade() != null) {
            dto.setTipoAtividadeNome(atividade.getTipoAtividade().getNome());
            dto.setTipoAtividadeId(atividade.getTipoAtividade().getId());
        }

        if (atividade.getSetor() != null) {
            dto.setSetorNome(atividade.getSetor().getNome());
            dto.setSetorId(atividade.getSetor().getId());
        }

        if (atividade.getResponsavel() != null) {
            dto.setResponsavelNome(atividade.getResponsavel().getNomeCompleto());
            dto.setResponsavelId(atividade.getResponsavel().getId());
        }

        if (atividade.getEquipamento() != null) {
            dto.setEquipamentoNome(atividade.getEquipamento().getNome());
            dto.setEquipamentoId(atividade.getEquipamento().getId());
        } else {
            dto.setEquipamentoNome("-");
        }

        return dto;
    }
}
