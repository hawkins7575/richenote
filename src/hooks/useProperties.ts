// ============================================================================
// 매물 관리 커스텀 훅
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { getProperties, getPropertyStats, createProperty, updateProperty, deleteProperty, updatePropertyStatus } from '@/services'
import type { Property, SimplePropertyFilters, CreatePropertyData, UpdatePropertyData } from '@/types'

export const useProperties = (filters?: SimplePropertyFilters) => {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async () => {
    if (!tenant?.id) {
      console.log('⏳ 테넌트 정보 대기 중...')
      setLoading(false)
      setError(null)
      setProperties([])
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 매물 데이터 로딩 중... (테넌트:', tenant.name, ')')
      
      // 실제 서비스 함수 호출
      const data = await getProperties(tenant.id, filters)
      
      console.log('✅ 실제 데이터 로딩 성공:', data)
      setProperties(data || [])
    } catch (err) {
      console.error('❌ 데이터 로딩 실패:', err)
      setError('매물을 불러오는 중 오류가 발생했습니다.')
      // 에러 발생시 빈 배열로 설정
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, filters])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const createNewProperty = useCallback(async (propertyData: CreatePropertyData) => {
    if (!tenant?.id || !user?.id) {
      throw new Error('인증 정보가 없습니다.')
    }

    try {
      const newProperty = await createProperty(propertyData, tenant.id, user.id)
      setProperties(prev => [newProperty, ...prev])
      return newProperty
    } catch (err) {
      console.error('Error creating property:', err)
      throw new Error('매물 생성 중 오류가 발생했습니다.')
    }
  }, [tenant?.id, user?.id])

  const updateExistingProperty = useCallback(async (propertyId: string, propertyData: UpdatePropertyData) => {
    if (!tenant?.id) {
      throw new Error('테넌트 정보가 없습니다.')
    }

    try {
      const updatedProperty = await updateProperty(propertyId, propertyData, tenant.id)
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? updatedProperty : p).filter((p): p is Property => p !== null)
      )
      return updatedProperty
    } catch (err) {
      console.error('Error updating property:', err)
      throw new Error('매물 수정 중 오류가 발생했습니다.')
    }
  }, [tenant?.id])

  const deleteExistingProperty = useCallback(async (propertyId: string) => {
    if (!tenant?.id) {
      throw new Error('테넌트 정보가 없습니다.')
    }

    try {
      await deleteProperty(propertyId, tenant.id)
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (err) {
      console.error('Error deleting property:', err)
      throw new Error('매물 삭제 중 오류가 발생했습니다.')
    }
  }, [tenant?.id])

  const updateStatus = useCallback(async (propertyId: string, status: Property['status']) => {
    if (!tenant?.id) {
      throw new Error('테넌트 정보가 없습니다.')
    }

    try {
      const updatedProperty = await updatePropertyStatus(propertyId, status, tenant.id)
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? updatedProperty : p).filter((p): p is Property => p !== null)
      )
      return updatedProperty
    } catch (err) {
      console.error('Error updating property status:', err)
      throw new Error('매물 상태 변경 중 오류가 발생했습니다.')
    }
  }, [tenant?.id])

  return {
    properties,
    loading,
    error,
    refreshProperties: fetchProperties,
    createProperty: createNewProperty,
    updateProperty: updateExistingProperty,
    deleteProperty: deleteExistingProperty,
    updatePropertyStatus: updateStatus,
  }
}

export const usePropertyStats = () => {
  const { tenant } = useTenant()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!tenant?.id) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await getPropertyStats(tenant.id)
        setStats(data)
      } catch (err) {
        console.error('Error fetching property stats:', err)
        setError('통계를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tenant?.id])

  return { stats, loading, error }
}