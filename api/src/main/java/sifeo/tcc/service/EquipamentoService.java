package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.dto.request.EquipamentoRequestDTO;
import sifeo.tcc.models.dto.response.EquipamentoResponseDTO;
import sifeo.tcc.models.entities.Equipamento;
import sifeo.tcc.models.entities.Sitio;
import sifeo.tcc.repository.EquipamentoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final SitioService sitioService;
    private final AutenticacaoService autenticacaoService;

    public EquipamentoService(EquipamentoRepository equipamentoRepository, SitioService sitioService, AutenticacaoService autenticacaoService) {
        this.equipamentoRepository = equipamentoRepository;
        this.sitioService = sitioService;
        this.autenticacaoService = autenticacaoService;
    }

    @Transactional(readOnly = true)
    public List<EquipamentoResponseDTO> listarTodos(Integer sitioId) {
        List<Equipamento> equipamentos;
        if (sitioId != null) {
            sitioService.buscarSitioSeguro(sitioId);
            equipamentos = equipamentoRepository.findBySitioId(sitioId);
        } else {
            Integer usuarioId = autenticacaoService.usuarioLogado().getId();
            equipamentos = equipamentoRepository.findBySitio_Usuario_Id(usuarioId);
        }
        return equipamentos.stream().map(this::mapearParaDTO).collect(Collectors.toList());
    }

    @Transactional
    public EquipamentoResponseDTO cadastrar(EquipamentoRequestDTO dto) {
        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        Equipamento equipamento = new Equipamento();
        preencherEntidade(equipamento, dto, sitio);

        Equipamento salvo = equipamentoRepository.save(equipamento);
        return mapearParaDTO(salvo);
    }

    @Transactional
    public EquipamentoResponseDTO atualizar(Integer id, EquipamentoRequestDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Equipamento não encontrado."));
        sitioService.validarPropriedadeDoUsuario(equipamento.getSitio());

        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        preencherEntidade(equipamento, dto, sitio);

        Equipamento atualizado = equipamentoRepository.save(equipamento);
        return mapearParaDTO(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Equipamento não encontrado para exclusão."));
        sitioService.validarPropriedadeDoUsuario(equipamento.getSitio());

        try {
            equipamentoRepository.delete(equipamento);
            equipamentoRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RegraNegocioException("Não é possível excluir este equipamento pois existem registros vinculados a ele (atividades, documentos).");
        }
    }

    private void preencherEntidade(Equipamento eqp, EquipamentoRequestDTO dto, Sitio sitio) {
        eqp.setSitio(sitio);
        eqp.setNome(dto.getNome());
        eqp.setTipo(dto.getTipo());
        eqp.setMarcaModelo(dto.getMarcaModelo());
        eqp.setAno(dto.getAno());
        eqp.setStatus(dto.getStatus());
        eqp.setDataAquisicao(dto.getDataAquisicao());
        eqp.setDataVenda(dto.getDataVenda());
        eqp.setDescricao(dto.getDescricao());
    }

    private EquipamentoResponseDTO mapearParaDTO(Equipamento eqp) {
        EquipamentoResponseDTO dto = new EquipamentoResponseDTO();
        dto.setId(eqp.getId());
        dto.setNome(eqp.getNome());
        dto.setTipo(eqp.getTipo());
        dto.setMarcaModelo(eqp.getMarcaModelo());
        dto.setAno(eqp.getAno());
        dto.setStatus(eqp.getStatus());
        dto.setDataAquisicao(eqp.getDataAquisicao());
        dto.setDataVenda(eqp.getDataVenda());
        dto.setDescricao(eqp.getDescricao());
        if (eqp.getSitio() != null) {
            dto.setNomePropriedade(eqp.getSitio().getNome());
        }
        return dto;
    }
}
