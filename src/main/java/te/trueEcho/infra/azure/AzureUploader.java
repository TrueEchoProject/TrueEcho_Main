package te.trueEcho.infra.azure;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobStorageException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@RequiredArgsConstructor
@Component
public class AzureUploader {

    private final Environment env;

    private String getConnectionString() {
        return env.getProperty("azure.storage.connection-string");
    }

    private String getContainerName() {
        return env.getProperty("azure.storage.container-name");
    }

    private BlobServiceClient createBlobServiceClient() {
        return new BlobServiceClientBuilder().connectionString(getConnectionString()).buildClient();
    }

    public String uploadImage(MultipartFile file) {

        // 컨테이너 생성
        BlobServiceClient blobServiceClient = createBlobServiceClient();
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(getContainerName());

        // 파일 이름 생성
        String originalFilename = file.getOriginalFilename();
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String filename = originalFilename + "_" + timestamp;

        BlobClient blobClient = containerClient.getBlobClient(filename);

        try (InputStream inputStream = file.getInputStream()) {
            blobClient.upload(inputStream, file.getSize());
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to Azure Storage", e);
        }

        return blobClient.getBlobUrl();
    }

    public void deleteImage(String blobName) {
        BlobServiceClient blobServiceClient = createBlobServiceClient();
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(getContainerName());
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        try{
            blobClient.delete();
        }catch (BlobStorageException e){
            log.warn("Failed to delete file from Azure Storage", e);
        }
    }

}