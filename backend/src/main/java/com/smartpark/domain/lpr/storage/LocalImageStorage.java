package com.smartpark.domain.lpr.storage;
import com.smartpark.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.file.*;
import java.util.UUID;
@Component
public class LocalImageStorage implements ImageStorage {
 private final Path root;
 public LocalImageStorage(@Value("${app.integration.lpr.storage-root:./data/lpr}") String root){this.root=Path.of(root).toAbsolutePath().normalize();}
 public String store(byte[] content,String contentType){String ext=contentType.equals("image/png")?".png":".jpg";try{Files.createDirectories(root);Path target=root.resolve(UUID.randomUUID()+ext).normalize();if(!target.startsWith(root))throw new SecurityException();Files.write(target,content,StandardOpenOption.CREATE_NEW);return target.toString();}catch(Exception ex){throw new BusinessException("ERR-LPR-001","Unable to store LPR image");}}
}
