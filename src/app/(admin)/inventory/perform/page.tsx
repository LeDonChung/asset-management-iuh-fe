'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { clearUnitRooms } from '@/lib/store/slices/inventorySlice';
import {
  PeriodSelection,
  UnitSelection,
  RoomSelection
} from '@/components/inventory/steps';
import {
  Room,
  Unit,
  InventorySession
} from '@/types/asset';

// Define steps for the inventory process
enum InventoryStep {
  PERIOD_SELECTION = 'period_selection',
  UNIT_SELECTION = 'unit_selection',
  ROOM_SELECTION = 'room_selection',
}

const InventoryPerformPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {assignedGroups} = useAppSelector(state => state.inventory);
  // Step management state
  const [currentStep, setCurrentStep] = useState<InventoryStep>(InventoryStep.PERIOD_SELECTION);

  // Selected data state
  const [selectedPeriod, setSelectedPeriod] = useState<InventorySession | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Navigation functions
  const goToPeriodSelection = () => {
    dispatch(clearUnitRooms());
    setSelectedPeriod(null);
    setSelectedUnit(null);
    setCurrentStep(InventoryStep.PERIOD_SELECTION);
  };

  const goToUnitSelection = () => {
    dispatch(clearUnitRooms());
    setSelectedUnit(null);
    setCurrentStep(InventoryStep.UNIT_SELECTION);
  };

  const goToRoomSelection = (unit: Unit) => {
    setSelectedUnit(unit);
    setCurrentStep(InventoryStep.ROOM_SELECTION);
  };

  // Handle period selection
  const handlePeriodSelect = (period: InventorySession) => {
    setSelectedPeriod(period);
    setCurrentStep(InventoryStep.UNIT_SELECTION);
  };


  // Handle room selection - navigate to active inventory page
  const handleRoomSelect = (room: Room) => {
    if (!selectedPeriod || !selectedUnit) return;
    
    // Navigate to the active inventory page with session, unit, and room IDs
    const assignmentId = assignedGroups.find((group) => group.unitId === selectedUnit.id)?.id;
    router.push(`/inventory/${selectedPeriod.id}/active?unitId=${selectedUnit.id}&roomId=${room.id}&assignmentId=${assignmentId}`);
  };

  // Handle room inventory results - navigate to active inventory page to view results
  const handleRoomInventoryResults = (roomId: string, results: any[]) => {
    if (!selectedPeriod || !selectedUnit) return;
    
    // Navigate to the active inventory page to view submitted results
    const assignmentId = assignedGroups.find((group) => group.unitId === selectedUnit.id)?.id;
    router.push(`/inventory/${selectedPeriod.id}/active?unitId=${selectedUnit.id}&roomId=${roomId}&assignmentId=${assignmentId}&results=true`);
  };

  // Render Period Selection Step
  const renderPeriodSelection = () => (
    <PeriodSelection
      selectedPeriod={selectedPeriod}
      onPeriodSelect={handlePeriodSelect}
    />
  );

  // Render Unit Selection Step
  const renderUnitSelection = () => {
    if (!selectedPeriod) return null;
    
    return (
      <UnitSelection
        selectedPeriod={selectedPeriod}
        onUnitSelect={goToRoomSelection}
        onBackToPeriod={goToPeriodSelection}
      />
    );
  };

  // Render Room Selection Step
  const renderRoomSelection = () => {
    if (!selectedPeriod || !selectedUnit) return null;
    
    return (
      <RoomSelection
        selectedUnit={selectedUnit}
        assignmentId={assignedGroups.find((group) => group.unitId === selectedUnit.id)?.id}
        selectedPeriod={selectedPeriod}
        onRoomSelect={handleRoomSelect}
        onRoomInventoryResults={handleRoomInventoryResults}
        onBackToUnit={goToUnitSelection}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto">
        {/* Step Navigation */}
        {currentStep === InventoryStep.PERIOD_SELECTION && renderPeriodSelection()}
        {currentStep === InventoryStep.UNIT_SELECTION && renderUnitSelection()}
        {currentStep === InventoryStep.ROOM_SELECTION && renderRoomSelection()}
      </div>
    </div>
  );
};

export default InventoryPerformPage;