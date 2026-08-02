package com.acd.researchrepo.mapper;

import com.acd.researchrepo.dto.external.papers.PaperResponse;
import com.acd.researchrepo.model.ResearchPaper;
import org.springframework.stereotype.Component;

@Component
public class ResearchPaperMapper {

  private final DepartmentMapper departmentMapper;
  private final UserMapper userMapper;

  public ResearchPaperMapper(DepartmentMapper departmentMapper, UserMapper userMapper) {
    this.departmentMapper = departmentMapper;
    this.userMapper = userMapper;
  }

  public PaperResponse toDto(ResearchPaper paper) {
    if (paper == null) {
      return null;
    }

    return PaperResponse.builder()
        .paperId(paper.getPaperId())
        .title(paper.getTitle())
        .authorName(paper.getAuthorName())
        .abstractText(paper.getAbstractText())
        .department(departmentMapper.toDto(paper.getDepartment()))
        .submissionDate(paper.getSubmissionDate())
        .filePath(paper.getFilePath())
        .status(paper.getStatus().name())
        .uploadedBy(paper.getUploadedBy() != null ? userMapper.toDto(paper.getUploadedBy()) : null)
        .archived(paper.getArchived())
        .archivedAt(paper.getArchivedAt())
        .build();
  }
}
