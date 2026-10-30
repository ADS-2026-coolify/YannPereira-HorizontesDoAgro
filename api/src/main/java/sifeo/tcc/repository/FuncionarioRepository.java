package sifeo.tcc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sifeo.tcc.models.entities.Funcionario;

import java.util.List;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {
    List<Funcionario> findBySitioId(Integer sitioId);

    List<Funcionario> findBySitio_Usuario_Id(Integer usuarioId);

    boolean existsByCpfAndIdNot(String cpf, Integer id);

    boolean existsByEmailAndIdNot(String email, Integer id);

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);
}