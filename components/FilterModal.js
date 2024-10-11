import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const FilterModal = ({ isVisible, onClose, onApply, currentFilters, genres }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const updateFilter = (filterType, value) => {
        setLocalFilters(prev => {
            const currentFilters = prev[filterType] || [];
            let updatedFilters;

            if (filterType === 'sort') {
                // For sorting, only one option can be selected
                updatedFilters = [value];
            } else {
                // For other filters, multiple options can be selected
                updatedFilters = currentFilters.includes(value)
                    ? currentFilters.filter(item => item !== value)
                    : [...currentFilters, value];
            }

            return {
                ...prev,
                [filterType]: updatedFilters
            };
        });
    };

    const renderFilterOptions = (options, filterType) => {
        return options.map(option => {
            const value = option.value || option;
            const label = option.label || option;
            const isSelected = localFilters[filterType] && localFilters[filterType].includes(value);

            return (
                <TouchableOpacity
                    key={value}
                    style={[
                        styles.filterOption,
                        isSelected && styles.selectedOption
                    ]}
                    onPress={() => updateFilter(filterType, value)}
                >
                    <Text style={[
                        styles.filterOptionText,
                        isSelected && styles.selectedOptionText
                    ]}>
                        {label}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalContainer}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.modalContent}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <SafeAreaView>
                        <Text style={styles.title}>Filters and Sorting</Text>
                        <View style={styles.contentContainer}>
                            <Text style={styles.sectionTitle}>Categories</Text>
                            <View style={styles.categoriesContainer}>
                                {renderFilterOptions(genres.map(genre => ({
                                    value: genre.id.toString(),
                                    label: genre.name
                                })), 'categories')}
                            </View>

                            <Text style={styles.sectionTitle}>Time Periods</Text>
                            <View style={styles.optionsContainer}>
                                {renderFilterOptions(['2020s', '2010s', '2000s', '1990s'], 'timePeriods')}
                            </View>

                            <Text style={styles.sectionTitle}>Sort By</Text>
                            <View style={styles.optionsContainer}>
                                {renderFilterOptions([
                                    { label: 'Popularity', value: 'popularity.desc' },
                                    { label: 'Rating', value: 'vote_average.desc' },
                                ], 'sort')}
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.resetButton} onPress={() => setLocalFilters(currentFilters)}>
                                <Text style={styles.resetButtonText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent ',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        text: 'Filters and Sorting',
    },
    scrollView: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#FFFFFF',
    },
    optionsRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    filterOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: '#333333',

    },
    selectedOption: {
        backgroundColor: '#e50914',
        borderColor: '#e50914',
    },
    filterOptionText: {
        color: '#FFFFFF',
    },
    selectedOptionText: {
        color: '#FFFFFF',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    resetButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#333333',
        marginRight: 10,
    },
    resetButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: 'bold',
        text: 'Reset',
    },
    applyButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#e50914',
    },
    applyButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: 'bold',
        text: 'Apply',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        justifyContent: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        justifyContent: 'center'
    },
    contentContainer: {
        marginBottom: 20,
    },
});

export default FilterModal;
