package com.app.homeservice.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminDashboardStatsResponse {

    private long totalBookings;
    private long completedBookings;
    private long pendingBookings;
    private long inProgressBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;
    private long totalCustomers;
    private long totalProviders;
    private long verifiedProviders;
    private long pendingVerifications;
    private long openComplaints;
    private List<CategoryStatDto> categoryStats;
    private List<BookingResponse> recentBookings;

    public AdminDashboardStatsResponse() {}

    public static class CategoryStatDto {
        private String categoryName;
        private String categoryCode;
        private long bookingCount;
        private BigDecimal totalRevenue;

        public CategoryStatDto() {}

        public CategoryStatDto(String categoryName, String categoryCode, long bookingCount, BigDecimal totalRevenue) {
            this.categoryName = categoryName;
            this.categoryCode = categoryCode;
            this.bookingCount = bookingCount;
            this.totalRevenue = totalRevenue;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public String getCategoryCode() {
            return categoryCode;
        }

        public void setCategoryCode(String categoryCode) {
            this.categoryCode = categoryCode;
        }

        public long getBookingCount() {
            return bookingCount;
        }

        public void setBookingCount(long bookingCount) {
            this.bookingCount = bookingCount;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getInProgressBookings() {
        return inProgressBookings;
    }

    public void setInProgressBookings(long inProgressBookings) {
        this.inProgressBookings = inProgressBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalProviders() {
        return totalProviders;
    }

    public void setTotalProviders(long totalProviders) {
        this.totalProviders = totalProviders;
    }

    public long getVerifiedProviders() {
        return verifiedProviders;
    }

    public void setVerifiedProviders(long verifiedProviders) {
        this.verifiedProviders = verifiedProviders;
    }

    public long getPendingVerifications() {
        return pendingVerifications;
    }

    public void setPendingVerifications(long pendingVerifications) {
        this.pendingVerifications = pendingVerifications;
    }

    public long getOpenComplaints() {
        return openComplaints;
    }

    public void setOpenComplaints(long openComplaints) {
        this.openComplaints = openComplaints;
    }

    public List<CategoryStatDto> getCategoryStats() {
        return categoryStats;
    }

    public void setCategoryStats(List<CategoryStatDto> categoryStats) {
        this.categoryStats = categoryStats;
    }

    public List<BookingResponse> getRecentBookings() {
        return recentBookings;
    }

    public void setRecentBookings(List<BookingResponse> recentBookings) {
        this.recentBookings = recentBookings;
    }
}
