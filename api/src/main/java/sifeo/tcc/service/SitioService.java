package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.AcessoNegadoException;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.models.dto.request.SitioRequestDTO;
import sifeo.tcc.models.dto.request.SitioResponseDTO;
import sifeo.tcc.models.dto.response.SetorResponseDTO;
import sifeo.tcc.models.entities.Sitio;
import sifeo.tcc.models.entities.Usuario;
import sifeo.tcc.repository.*;
import sifeo.tcc.utils.DocumentoValidator;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SitioService {

    private final SitioRepository sitioRepository;
    private final AutenticacaoService autenticacaoService;
    private final SetorRepository setorRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final InsumoRepository insumoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final TipoAtividadeRepository tipoAtividadeRepository;
    private final ClimaRepository climaRepository;
    private final HistoricoAtividadeRepository atividadeRepository;
    private final DocumentoRepository documentoRepository;

    public SitioService(
            SitioRepository sitioRepository,
            AutenticacaoService autenticacaoService,
            SetorRepository setorRepository,
            EquipamentoRepository equipamentoRepository,
            InsumoRepository insumoRepository,
            FuncionarioRepository funcionarioRepository,
            TipoAtividadeRepository tipoAtividadeRepository,
            ClimaRepository climaRepository,
            HistoricoAtividadeRepository atividadeRepository,
            DocumentoRepository documentoRepository) {
        this.sitioRepository = sitioRepository;
        this.autenticacaoService = autenticacaoService;
        this.setorRepository = setorRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.insumoRepository = insumoRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.tipoAtividadeRepository = tipoAtividadeRepository;
        this.climaRepository = climaRepository;
        this.atividadeRepository = atividadeRepository;
        this.documentoRepository = documentoRepository;
    }

    private Sitio buscarSitioSeguro(Integer idSitio, Usuario usuarioLogado) {
        Sitio sitio = sitioRepository.findById(idSitio)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Propriedade não encontrada com o ID: " + idSitio));

        if (!sitio.getUsuario().getId().equals(usuarioLogado.getId())) {
            throw new AcessoNegadoException("Violação de segurança: Você não tem permissão para acessar ou modificar esta propriedade.");
        }
        return sitio;
    }

    @Transactional(readOnly = true)
    public Sitio buscarSitioSeguro(Integer idSitio) {
        return buscarSitioSeguro(idSitio, autenticacaoService.usuarioLogado());
    }

    @Transactional(readOnly = true)
    public void validarPropriedadeDoUsuario(Sitio sitio) {
        Usuario usuarioLogado = autenticacaoService.usuarioLogado();
        if (sitio == null || !sitio.getUsuario().getId().equals(usuarioLogado.getId())) {
            throw new AcessoNegadoException("Violação de segurança: Você não tem permissão para acessar este registro.");
        }
    }

    private void validarIntegridadeDosDados(SitioRequestDTO dto) {
        if (dto.getCnpj() != null && !dto.getCnpj().trim().isEmpty()) {
            DocumentoValidator.validarCpfCnpj(dto.getCnpj());
        }

        if (dto.getCep() != null && !dto.getCep().trim().isEmpty()) {
            DocumentoValidator.validarCep(dto.getCep());
        }
    }

    private String extrairApenasNumeros(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        return valor.replaceAll("\\D", "");
    }

    private SitioResponseDTO converterParaDTO(Sitio sitio) {
        SitioResponseDTO dto = new SitioResponseDTO();
        dto.setId(sitio.getId());
        dto.setNome(sitio.getNome());
        dto.setCnpj(sitio.getCnpj());
        dto.setCep(sitio.getCep());
        dto.setEndereco(sitio.getEndereco());
        dto.setMunicipio(sitio.getMunicipio());
        dto.setUf(sitio.getUf());
        dto.setQuantidadeSetores(sitio.getSetores() != null ? sitio.getSetores().size() : 0);

        if (sitio.getSetores() != null) {
            dto.setSetores(sitio.getSetores().stream().map(setor -> {
                SetorResponseDTO setorDto = new SetorResponseDTO();
                setorDto.setId(setor.getId());
                setorDto.setNome(setor.getNome());
                setorDto.setHectares(setor.getHectares());
                setorDto.setPlantio(setor.getPlantio());
                setorDto.setStatus(setor.getStatus());
                setorDto.setDataEncerramento(setor.getDataEncerramento());
                setorDto.setNomePropriedade(sitio.getNome());
                return setorDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<SitioResponseDTO> listarSitiosDoUsuario(Integer usuarioId) {
        List<Sitio> sitios = sitioRepository.findByUsuarioId(usuarioId);
        return sitios.stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SitioResponseDTO criarSitio(SitioRequestDTO dto, Usuario usuarioLogado) {
        validarIntegridadeDosDados(dto);

        Sitio sitio = new Sitio();
        sitio.setNome(dto.getNome());
        sitio.setCnpj(extrairApenasNumeros(dto.getCnpj()));
        sitio.setCep(extrairApenasNumeros(dto.getCep()));

        sitio.setEndereco(dto.getEndereco());
        sitio.setMunicipio(dto.getMunicipio());
        sitio.setUf(dto.getUf());
        sitio.setUsuario(usuarioLogado);

        Sitio sitioSalvo = sitioRepository.save(sitio);
        return converterParaDTO(sitioSalvo);
    }

    @Transactional
    public SitioResponseDTO atualizarSitio(Integer id, SitioRequestDTO dto, Usuario usuarioLogado) {
        Sitio sitio = buscarSitioSeguro(id, usuarioLogado);

        validarIntegridadeDosDados(dto);

        sitio.setNome(dto.getNome());

        sitio.setCnpj(extrairApenasNumeros(dto.getCnpj()));
        sitio.setCep(extrairApenasNumeros(dto.getCep()));

        sitio.setEndereco(dto.getEndereco());
        sitio.setMunicipio(dto.getMunicipio());
        sitio.setUf(dto.getUf());

        sitio = sitioRepository.save(sitio);
        return converterParaDTO(sitio);
    }

    @Transactional
    public void deletarSitio(Integer id, Usuario usuarioLogado) {
        Sitio sitio = buscarSitioSeguro(id, usuarioLogado);

        documentoRepository.deleteAll(documentoRepository.findBySitioId(id));
        atividadeRepository.deleteAll(atividadeRepository.findBySitioId(id));
        climaRepository.deleteAll(climaRepository.findBySitioIdOrderByDataHoraDesc(id));
        setorRepository.deleteAll(setorRepository.findBySitioId(id));
        equipamentoRepository.deleteAll(equipamentoRepository.findBySitioId(id));
        insumoRepository.deleteAll(insumoRepository.findBySitioId(id));
        funcionarioRepository.deleteAll(funcionarioRepository.findBySitioId(id));
        tipoAtividadeRepository.deleteAll(tipoAtividadeRepository.findBySitioIdOrderByNomeAsc(id));

        sitioRepository.delete(sitio);
    }
}
