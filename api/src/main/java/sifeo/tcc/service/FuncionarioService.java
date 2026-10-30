package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.dto.request.FuncionarioRequestDTO;
import sifeo.tcc.models.dto.response.FuncionarioResponseDTO;
import sifeo.tcc.models.entities.Funcionario;
import sifeo.tcc.models.entities.Sitio;
import sifeo.tcc.models.enums.StatusFuncionario;
import sifeo.tcc.repository.FuncionarioRepository;
import sifeo.tcc.utils.DocumentoValidator;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final SitioService sitioService;
    private final AutenticacaoService autenticacaoService;

    public FuncionarioService(FuncionarioRepository repository, SitioService sitioService, AutenticacaoService autenticacaoService) {
        this.repository = repository;
        this.sitioService = sitioService;
        this.autenticacaoService = autenticacaoService;
    }

    @Transactional(readOnly = true)
    public List<FuncionarioResponseDTO> listarPorSitio(Integer sitioId) {
        List<Funcionario> funcionarios;

        if (sitioId != null) {
            sitioService.buscarSitioSeguro(sitioId);
            funcionarios = repository.findBySitioId(sitioId);
        } else {
            Integer usuarioId = autenticacaoService.usuarioLogado().getId();
            funcionarios = repository.findBySitio_Usuario_Id(usuarioId);
        }

        return funcionarios.stream().map(this::mapearParaDTO).collect(Collectors.toList());
    }

    private FuncionarioResponseDTO mapearParaDTO(Funcionario f) {
        FuncionarioResponseDTO dto = new FuncionarioResponseDTO();
        dto.setId(f.getId());
        dto.setNomeCompleto(f.getNomeCompleto());
        dto.setCpf(f.getCpf());
        dto.setDataNascimento(f.getDataNascimento());
        dto.setTelefone(f.getTelefone());
        dto.setEmail(f.getEmail());
        dto.setCargo(f.getCargo());
        dto.setDataAdmissao(f.getDataAdmissao());
        dto.setStatus(f.getStatus());

        if (f.getSitio() != null) {
            dto.setPropriedadeNome(f.getSitio().getNome());
        }
        return dto;
    }

    @Transactional
    public FuncionarioResponseDTO cadastrar(FuncionarioRequestDTO dto) {
        String cpfLimpo = extrairApenasNumeros(dto.getCpf());

        if (cpfLimpo != null) {
            DocumentoValidator.validarCpfCnpj(cpfLimpo);
            if (repository.existsByCpf(cpfLimpo)) {
                throw new RegraNegocioException("Já existe um funcionário cadastrado com este CPF.");
            }
        }

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty() && repository.existsByEmail(dto.getEmail().trim())) {
            throw new RegraNegocioException("Já existe um funcionário cadastrado com este e-mail.");
        }

        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        Funcionario f = new Funcionario();
        f.setNomeCompleto(dto.getNomeCompleto());
        f.setCpf(cpfLimpo);
        f.setTelefone(dto.getTelefone());
        f.setEmail(dto.getEmail());
        f.setCargo(dto.getCargo());
        f.setDataAdmissao(dto.getDataAdmissao());
        f.setDataNascimento(dto.getDataNascimento());
        f.setStatus(dto.getStatus() != null ? dto.getStatus() : StatusFuncionario.ATIVO);
        f.setSitio(sitio);

        f = repository.save(f);
        return mapearParaDTO(f);
    }

    private String extrairApenasNumeros(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        return valor.replaceAll("\\D", "");
    }

    @Transactional
    public void deletar(Integer id) {
        Funcionario f = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado com o ID: " + id));
        sitioService.validarPropriedadeDoUsuario(f.getSitio());

        try {
            repository.delete(f);
            repository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RegraNegocioException("Não é possível excluir. Este funcionário possui vínculos ativos no sistema.");
        }
    }

    @Transactional
    public FuncionarioResponseDTO atualizar(Integer id, FuncionarioRequestDTO dto) {
        String cpfLimpo = extrairApenasNumeros(dto.getCpf());

        Funcionario f = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário não encontrado com ID: " + id));
        sitioService.validarPropriedadeDoUsuario(f.getSitio());

        if (cpfLimpo != null) {
            DocumentoValidator.validarCpfCnpj(cpfLimpo);
            if (repository.existsByCpfAndIdNot(cpfLimpo, id)) {
                throw new RegraNegocioException("Já existe um funcionário cadastrado com este CPF.");
            }
        }

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()
                && repository.existsByEmailAndIdNot(dto.getEmail().trim(), id)) {
            throw new RegraNegocioException("Já existe um funcionário cadastrado com este e-mail.");
        }

        f.setNomeCompleto(dto.getNomeCompleto());
        f.setCpf(cpfLimpo);
        f.setTelefone(dto.getTelefone());
        f.setEmail(dto.getEmail());
        f.setCargo(dto.getCargo());
        f.setDataAdmissao(dto.getDataAdmissao());
        f.setDataNascimento(dto.getDataNascimento());
        f.setStatus(dto.getStatus() != null ? dto.getStatus() : StatusFuncionario.ATIVO);

        f = repository.save(f);
        return mapearParaDTO(f);
    }
}
