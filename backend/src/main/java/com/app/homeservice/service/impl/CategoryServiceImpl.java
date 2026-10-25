package com.app.homeservice.service.impl;

import com.app.homeservice.dto.CategoryRequest;
import com.app.homeservice.dto.CategoryResponse;
import com.app.homeservice.entity.ServiceCategory;
import com.app.homeservice.exception.BadRequestException;
import com.app.homeservice.exception.ResourceNotFoundException;
import com.app.homeservice.repository.ServiceCategoryRepository;
import com.app.homeservice.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final ServiceCategoryRepository categoryRepository;

    public CategoryServiceImpl(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        ServiceCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return CategoryResponse.fromEntity(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (categoryRepository.findByCode(code).isPresent()) {
            throw new BadRequestException("Category code already exists: " + code);
        }

        ServiceCategory category = new ServiceCategory(
                null,
                request.getName().trim(),
                code,
                request.getDescription(),
                request.getBasePrice(),
                request.getIconUrl(),
                request.isActive()
        );

        ServiceCategory saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        ServiceCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setBasePrice(request.getBasePrice());
        category.setIconUrl(request.getIconUrl());
        category.setActive(request.isActive());

        ServiceCategory saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        ServiceCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        category.setActive(false);
        categoryRepository.save(category);
    }
}
