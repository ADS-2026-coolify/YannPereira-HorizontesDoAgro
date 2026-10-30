package sifeo.tcc.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sifeo.tcc.models.entities.Setor;
import java.util.List;

@Repository
public interface SetorRepository extends JpaRepository<Setor, Integer> {

    List<Setor> findBySitioId(Integer sitioId);

    List<Setor> findBySitio_Usuario_Id(Integer usuarioId);
}